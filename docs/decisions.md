# Architectural Decision Records (ADRs)

> **Status**: 📝 Active Document
> **Last Updated**: December 2025

---

## Table of Contents

- [Overview](#overview)
- [Decision Log](#decision-log)
- [ADR-001: Architecture-First Approach](#adr-001-architecture-first-approach)
- [ADR-002: Git Branching Strategy](#adr-002-git-branching-strategy)
- [ADR-003: Branch Protection Rules](#adr-003-branch-protection-rules)
- [ADR-004: Monorepo Structure](#adr-004-monorepo-structure)
- [Pending Decisions](#pending-decisions)

---

## Overview

This document records significant architectural decisions made for the Janta Pharmacy project. Each decision follows the ADR format:

- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: What situation led to this decision?
- **Decision**: What did we decide?
- **Consequences**: What are the trade-offs?

---

## Decision Log

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Architecture-First Approach | Accepted | 2025-12 |
| ADR-002 | Git Branching Strategy | Accepted | 2025-12 |
| ADR-003 | Branch Protection Rules | Accepted | 2025-12 |
| ADR-004 | Monorepo Structure | Accepted | 2025-12 |
| ADR-005 | Backend Technology Stack | Accepted | 2025-12 |
| ADR-006 | Order State Machine Pattern | Accepted | 2025-12 |
| ADR-007 | Cart as Draft Order | Accepted | 2026-01 |
| ADR-008 | Deferred Database Integration | Accepted | 2026-01 |

---

## ADR-001: Architecture-First Approach

### Status
**Accepted**

### Context
The project previously had experimental code without clear architecture. Starting fresh provides an opportunity to establish solid foundations before writing application code.

### Decision
We will follow an architecture-first approach:
1. Document system architecture before implementation
2. Make and record technology decisions upfront
3. Establish security and infrastructure patterns early
4. Create placeholder structure for all components

### Consequences

**Positive:**
- Clear direction for all contributors
- Reduced technical debt
- Better onboarding experience
- AI-assisted development is more effective with documentation

**Negative:**
- Slower initial progress
- Architecture may need revision as we learn
- Requires discipline to maintain documentation

**Mitigations:**
- Regular architecture reviews
- Living documentation that evolves with the project

---

## ADR-002: Git Branching Strategy

### Status
**Accepted**

### Context
Need a branching model that supports:
- Stable production releases
- Continuous integration of features
- Safe experimentation
- Clear contribution workflow

### Decision
Adopt a simplified GitFlow model:

```
main (protected)
  │
  ├── Production-ready code only
  ├── Tagged releases
  └── Deployed automatically
        │
develop (protected)
  │
  ├── Integration branch
  ├── Feature branches merge here
  └── Deployed to staging
        │
feature/* (developer branches)
  │
  ├── Created from develop
  ├── Short-lived (< 1 week ideal)
  └── Merged via PR to develop
        │
hotfix/* (emergency fixes)
  │
  ├── Created from main
  ├── Merged to main AND develop
  └── For critical production issues only
```

### Branch Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feature/` | New features | `feature/user-authentication` |
| `bugfix/` | Bug fixes | `bugfix/cart-calculation` |
| `hotfix/` | Production emergencies | `hotfix/security-patch` |
| `docs/` | Documentation updates | `docs/api-documentation` |
| `refactor/` | Code improvements | `refactor/order-service` |

### Consequences

**Positive:**
- Clear separation between stable and development code
- Safe experimentation in feature branches
- Predictable release process

**Negative:**
- Slightly more complex than trunk-based development
- Potential for long-lived branches (mitigated by guidelines)

---

## ADR-003: Branch Protection Rules

### Status
**Accepted**

### Context
Protected branches prevent accidental or unauthorized changes to critical branches. This is essential for:
- Maintaining code quality
- Ensuring review processes are followed
- Preventing direct pushes to production

### Decision
Implement the following branch protection rules:

### Main Branch Protection

| Rule | Setting | Rationale |
|------|---------|-----------|
| Require pull request | ✅ Enabled | No direct pushes |
| Required approvals | 1 (minimum) | Code review required |
| Dismiss stale approvals | ✅ Enabled | Re-review after changes |
| Require status checks | ✅ Enabled | CI must pass |
| Required checks | `validate`, `security` | Core pipeline jobs |
| Require branches up-to-date | ✅ Enabled | Must be current with main |
| Require conversation resolution | ✅ Enabled | All feedback addressed |
| Restrict pushes | ✅ Enabled | Only via PR |
| Allow force pushes | ❌ Disabled | Preserve history |
| Allow deletions | ❌ Disabled | Cannot delete main |

### Develop Branch Protection

| Rule | Setting | Rationale |
|------|---------|-----------|
| Require pull request | ✅ Enabled | No direct pushes |
| Required approvals | 1 | At least one review |
| Dismiss stale approvals | ✅ Enabled | Re-review after changes |
| Require status checks | ✅ Enabled | CI must pass |
| Required checks | `validate` | Basic validation |
| Require branches up-to-date | ❌ Disabled | Allow parallel merges |
| Allow force pushes | ❌ Disabled | Preserve history |
| Allow deletions | ❌ Disabled | Cannot delete develop |

### Implementation Steps

#### GitHub Settings Path
```
Repository → Settings → Branches → Add branch protection rule
```

#### For `main` branch:
1. Branch name pattern: `main`
2. Enable all rules as specified above
3. Save changes

#### For `develop` branch:
1. Branch name pattern: `develop`
2. Enable rules as specified above
3. Save changes

### Consequences

**Positive:**
- Code quality enforcement
- Audit trail for all changes
- Prevents accidental production issues

**Negative:**
- Slower merge process
- Requires at least two contributors for review
- Can block urgent fixes (mitigated by hotfix process)

**Mitigations:**
- Clear hotfix process for emergencies
- Automated checks run quickly
- Admin bypass for true emergencies (logged)

---

## ADR-004: Monorepo Structure

### Status
**Accepted**

### Context
Need to decide between:
1. **Monorepo**: All components in single repository
2. **Polyrepo**: Separate repository per component

### Decision
Use a **monorepo** structure with clear component boundaries:

```
janta-pharmacy/
├── backend/      # Backend services
├── frontend/     # Web application
├── mobile/       # Mobile application
├── infra/        # Infrastructure as Code
└── docs/         # Shared documentation
```

### Rationale

| Factor | Monorepo | Polyrepo |
|--------|----------|----------|
| Code sharing | Easy | Complex |
| Refactoring | Atomic | Coordinated |
| CI/CD | Single pipeline | Multiple pipelines |
| Dependency management | Centralized | Distributed |
| Team scaling | Needs tooling | Natural separation |

For our team size and project scope, monorepo advantages outweigh disadvantages.

### Consequences

**Positive:**
- Simplified code sharing
- Atomic refactoring across components
- Single source of truth
- Easier onboarding

**Negative:**
- Larger repository size over time
- Need selective CI/CD triggers
- All contributors see all code

**Mitigations:**
- Use sparse checkout for large repos
- Path-based CI/CD triggers
- CODEOWNERS file for review routing

---

## ADR-005: Backend Technology Stack

### Status
**Accepted**

### Context
Need to select a backend technology stack that:
- Supports rapid development
- Has strong TypeScript support
- Provides good structure for modular architecture
- Has mature ecosystem and documentation
- Suitable for a small team

### Decision
Adopt the following backend stack:

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js | JavaScript ecosystem, async I/O |
| Language | TypeScript | Type safety, better tooling |
| Framework | NestJS | Modular architecture, DI, decorators |
| ORM | Prisma | Type-safe queries, schema-first |
| Database | PostgreSQL | Reliable, SQL, JSON support |
| API Style | REST | Simplicity, wide tooling support |

### NestJS Module Structure

```
module/
├── domain/           # Business rules, state machines
├── dto/              # Data transfer objects
├── exceptions/       # Domain-specific errors
├── repositories/     # Data access layer
├── *.service.ts      # Business logic
├── *.controller.ts   # HTTP endpoints
└── *.module.ts       # Dependency wiring
```

### Consequences

**Positive:**
- Strong typing throughout the stack
- Clear architectural patterns (modules, DI)
- Good documentation and community
- Easy to onboard new developers
- Scales well for our expected load

**Negative:**
- JavaScript single-threaded nature for CPU-bound tasks
- Learning curve for NestJS patterns
- Prisma limitations for complex queries

**Mitigations:**
- Use worker threads for CPU-intensive tasks if needed
- Document patterns and provide examples
- Fallback to raw SQL for complex queries

---

## ADR-006: Order State Machine Pattern

### Status
**Accepted**

### Context
Order management requires:
- Clear lifecycle states (created, confirmed, paid, shipped, delivered, cancelled)
- Enforced state transitions (can't ship before payment)
- Audit trail for state changes
- Consistent error handling for invalid transitions

Options considered:
1. **Simple status field**: Just update status, validate in service
2. **State machine library**: Use xstate or similar
3. **Domain-driven state machine**: Custom implementation in domain layer

### Decision
Implement a **custom domain-driven state machine** within the Order module.

### Implementation Details

#### 1. Centralized State Transitions

```typescript
// order-state-machine.ts
const ALLOWED_TRANSITIONS = {
  CREATED:   [CONFIRMED, CANCELLED],
  CONFIRMED: [PAID, CANCELLED],
  PAID:      [SHIPPED, CANCELLED],
  SHIPPED:   [DELIVERED, CANCELLED],
  DELIVERED: [],  // Terminal
  CANCELLED: [],  // Terminal
};
```

#### 2. Command-Style Service Methods

```typescript
// Instead of: updateOrderStatus(id, newStatus)
// Use intent-based commands:
confirmOrder(orderId, userId, correlationId)
payForOrder(orderId, userId, correlationId)
cancelOrder(orderId, userId, correlationId)
```

#### 3. Intent-Based API Routes

```
POST /orders              → Create order (CREATED)
POST /orders/:id/confirm  → CREATED → CONFIRMED
POST /orders/:id/pay      → CONFIRMED → PAID
POST /orders/:id/cancel   → * → CANCELLED
```

#### 4. Domain Exceptions

| Exception | HTTP | When |
|-----------|------|------|
| `InvalidOrderStateTransitionException` | 409 | Transition not allowed |
| `OrderTerminalStateException` | 409 | Order in final state |
| `OrderCannotBeCancelledException` | 409 | Cancel not allowed |
| `OrderNotConfirmedException` | 409 | Pay before confirm |
| `OrderAlreadyConfirmedException` | 409 | Already confirmed |

#### 5. Comprehensive Logging

Every state transition logs:
```json
{
  "level": "INFO",
  "correlationId": "uuid",
  "message": "Order state transition: CONFIRM",
  "orderId": "uuid",
  "userId": "uuid",
  "previousState": "CREATED",
  "nextState": "CONFIRMED"
}
```

### Consequences

**Positive:**
- All transition rules in one place
- Easy to audit and modify
- Clear error messages for invalid operations
- Self-documenting code
- Extensible to other domains (Prescription, Payment)

**Negative:**
- More code than simple status updates
- Need to update state machine for new transitions
- Custom implementation vs battle-tested library

**Mitigations:**
- Keep state machine simple and well-documented
- Add comprehensive tests for transitions
- Consider xstate if complexity grows significantly

### Pattern Replication

This pattern should be applied to:
- Prescription lifecycle (uploaded → verified → approved/rejected)
- Payment lifecycle (pending → processing → completed/failed)
- Delivery lifecycle (assigned → picked → in-transit → delivered)

---

## ADR-007: Cart as Draft Order

### Status
**Accepted**

### Context
The system needs shopping cart functionality. Traditional approaches model cart as a separate entity that gets "converted" to an order at checkout. This creates:
- Data migration complexity
- Duplicate validation rules
- Inconsistent domain models

### Decision
Model the cart as an **Order in DRAFT state**.

The Order entity gains a new initial state (`DRAFT`) that represents a mutable cart. Checkout simply transitions DRAFT → CREATED.

### Implementation

```
Order States: DRAFT → CREATED → CONFIRMED → PAID → ...
                ↓
           [Cart operations allowed]
```

Cart operations:
- `createDraftOrder` — Create or return existing draft
- `addItemToCart` — Add product (increment if exists)
- `updateItemQuantity` — Change quantity
- `removeItemFromCart` — Remove product

Invariants:
- One active draft per user
- Only DRAFT orders are mutable
- Price captured at add-time (snapshot)

### Consequences

**Positive:**
- Single source of truth for order items
- No cart-to-order migration
- Consistent business rules
- Reuses Order domain (Money, OrderItem, totals)

**Negative:**
- Order entity more complex
- DRAFT state must be handled in all order queries

**Mitigations:**
- Clear separation between CartService and OrderService
- Explicit `isDraftOrder()` checks

---

## ADR-008: Deferred Database Integration

### Status
**Accepted**

### Context
The project needs data persistence. Options:
1. Integrate database immediately
2. Use in-memory repositories, add database later

### Decision
Use **in-memory repositories** during domain development. Defer PostgreSQL integration until domain model is stable.

### Rationale

| Phase | Data Strategy |
|-------|--------------|
| Domain design | In-memory — fast iteration |
| Domain stable | PostgreSQL — persistence |

Benefits:
- Schema changes are free (no migrations)
- Tests run fast (no database setup)
- Focus on business logic, not ORM
- Repository interfaces are well-defined

### Implementation

```typescript
// Interface
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  // ...
}

// Development
class InMemoryOrderRepository implements IOrderRepository { }

// Production (future)
class PrismaOrderRepository implements IOrderRepository { }
```

Swap via dependency injection when ready.

### Consequences

**Positive:**
- Faster development iteration
- Clean repository contracts
- No premature optimization

**Negative:**
- Data lost on restart
- Must implement real repository later

**Mitigations:**
- Clear interface contracts
- Sample data seeding for development
- Explicit plan for database phase

---

## Pending Decisions

The following decisions need to be made:

| Topic | Priority | Target Date |
|-------|----------|-------------|
| Frontend framework selection | ✅ Decided | Next.js |
| Database selection | ✅ Decided | PostgreSQL |
| Cloud provider | High | TBD |
| Mobile framework selection | Medium | TBD |
| Authentication provider | Medium | TBD |
| Monitoring/observability stack | Medium | TBD |

---

## Template for New ADRs

```markdown
## ADR-XXX: [Title]

### Status
Proposed | Accepted | Deprecated | Superseded by ADR-XXX

### Context
[What is the issue that we're seeing that is motivating this decision?]

### Decision
[What is the change that we're proposing and/or doing?]

### Consequences
[What becomes easier or more difficult to do because of this change?]
```

---

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

