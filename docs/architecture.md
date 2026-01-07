# System Architecture — Janta Pharmacy

## 1. Overview

Janta Pharmacy is a digital pharmacy platform enabling customers to browse medicines, manage carts, place orders, and track delivery.

This document describes **architectural decisions** and **system structure**.

**Design priorities:**
- Production-ready patterns
- Maintainable by a small team
- Evolvable as complexity grows

---

## 2. Architectural Style: Modular Monolith

The system is built as a **modular monolith**:
- Single deployable backend
- Clear internal module boundaries
- No shared internal state between modules

### Why Modular Monolith?

| Factor | Monolith Advantage |
|--------|-------------------|
| Team size (1-3 devs) | Lower operational overhead |
| Early stage | Faster iteration |
| Debugging | Single process, easier tracing |
| Transactions | Simple consistency |
| Future | Can extract to microservices later |

### Why Not Microservices?

- Adds operational complexity too early
- Increases cognitive load for small teams
- Slows early-stage development

**Decision:** Optimize for current constraints, not hypothetical scale.

---

## 3. System Components

```
┌─────────────────────────────────────────────────────────┐
│                     Web Frontend                        │
│                   (Next.js / React)                     │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────┐
│                        Backend                          │
│                       (NestJS)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │  Catalog │  │  Orders  │   ...        │
│  │  Module  │  │  Module  │  │  Module  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         │            │             │                    │
│         └────────────┴─────────────┘                    │
│              In-Memory Repositories                     │
│           (Database deferred by design)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Backend Modules

Each module owns its domain, data, and interfaces.

| Module | Responsibility | Status |
|--------|----------------|--------|
| Auth | User identity, JWT, sessions | ✅ Complete |
| User | User profiles, roles | ✅ Complete |
| Catalog | Products, categories, search | ✅ Complete |
| Order | Orders, cart, lifecycle | ✅ Complete |
| Prescription | Upload, review (future) | ⏳ Planned |
| Payment | Payment processing (future) | ⏳ Planned |

### Module Structure Pattern

```
module/
├── domain/           # Business rules, entities, value objects
├── dto/              # Data transfer objects
├── exceptions/       # Domain-specific errors
├── repositories/     # Data access interfaces + implementations
├── *.service.ts      # Application logic
├── *.controller.ts   # HTTP layer (thin)
└── *.module.ts       # Dependency wiring
```

---

## 5. Order Module — Domain Design

The Order module demonstrates **domain-driven design** with explicit lifecycle management.

### Order Lifecycle States

```
┌───────┐     ┌─────────┐     ┌───────────┐     ┌──────┐     ┌─────────┐     ┌───────────┐
│ DRAFT │────▶│ CREATED │────▶│ CONFIRMED │────▶│ PAID │────▶│ SHIPPED │────▶│ DELIVERED │
└───┬───┘     └────┬────┘     └─────┬─────┘     └──┬───┘     └────┬────┘     └───────────┘
    │              │                │              │              │              (terminal)
    │              ▼                ▼              ▼              ▼
    │         ┌────────────────────────────────────────────────────┐
    │         │                    CANCELLED                       │
    │         └────────────────────────────────────────────────────┘
    │                              (terminal)
    ▼
[Cart operations: add, update, remove items]
```

### State Descriptions

| Status | Description | Allowed Transitions |
|--------|-------------|---------------------|
| `DRAFT` | Cart — mutable, items can be added/removed | CREATED, CANCELLED |
| `CREATED` | Order placed, awaiting confirmation | CONFIRMED, CANCELLED |
| `CONFIRMED` | Validated, awaiting payment | PAID, CANCELLED |
| `PAID` | Payment received | SHIPPED, CANCELLED |
| `SHIPPED` | In transit | DELIVERED, CANCELLED |
| `DELIVERED` | Complete (terminal) | — |
| `CANCELLED` | Cancelled (terminal) | — |

---

## 6. Cart = Draft Order (Key Design Decision)

### The Decision

Shopping cart is **not** a separate entity. It is an Order in `DRAFT` state.

### Why?

| Benefit | Explanation |
|---------|-------------|
| Single source of truth | No cart-to-order migration |
| Consistent invariants | Same rules apply throughout |
| Natural lifecycle | DRAFT → CREATED is just a state transition |
| Domain reuse | OrderItem, Money, totals all shared |

### Cart Operations

All cart operations are **commands** that mutate the Draft Order:

| Operation | Behavior |
|-----------|----------|
| `createDraftOrder` | Create or return existing draft |
| `addItemToCart` | Add product (or increment if exists) |
| `updateItemQuantity` | Change quantity |
| `removeItemFromCart` | Remove product |
| Checkout (future) | Transition DRAFT → CREATED |

### Invariants Enforced

- **One draft per user** — Cannot have multiple carts
- **DRAFT orders only** — Non-draft orders are immutable
- **Ownership** — User can only modify their own cart
- **Quantity > 0** — Invalid quantities rejected
- **Price snapshot** — Unit price captured at add-time

---

## 7. Data & Repository Strategy

### Current: In-Memory Repositories

All modules use in-memory repositories during development:

```typescript
@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();
  // ...
}
```

### Why Defer Database?

| Reason | Impact |
|--------|--------|
| Domain must stabilize first | Schema changes are cheap in memory |
| Focus on business logic | No ORM ceremony during design |
| Fast tests | No database setup required |
| Clear interfaces | Repository contracts well-defined |

### Future: PostgreSQL via Prisma

When domain is stable:
1. Define Prisma schema matching domain
2. Implement `PrismaOrderRepository` behind same interface
3. Swap via dependency injection

---

## 8. API Design

### Principles

- **REST over HTTP/JSON**
- **Intent-based commands** — `POST /orders/:id/confirm` not `PATCH /orders/:id`
- **Thin controllers** — Business logic in services
- **Domain errors** — Bubble up with appropriate HTTP codes

### Cart API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get current draft |
| POST | `/cart` | Create or get draft |
| POST | `/cart/items` | Add item |
| PATCH | `/cart/items/:productId` | Update quantity |
| DELETE | `/cart/items/:productId` | Remove item |

### Order API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List user's orders |
| GET | `/orders/:id` | Get order details |
| POST | `/orders` | Create order |
| POST | `/orders/:id/confirm` | Confirm |
| POST | `/orders/:id/pay` | Record payment |
| POST | `/orders/:id/cancel` | Cancel |

---

## 9. Security Model

- **Authentication** — JWT access tokens + refresh tokens
- **Authorization** — Role-based, enforced at service layer
- **Ownership** — Users can only access their own data
- **No client-provided userId** — Extracted from JWT

---

## 10. What's Intentionally Deferred

| Item | Rationale |
|------|-----------|
| PostgreSQL | Domain stabilization first |
| Caching | No performance bottleneck yet |
| Message queues | No async requirements yet |
| Kubernetes | No deployment target |
| Mobile app | Web-first validation |

These will be added when **justified by real requirements**, not speculation.

---

## 11. Evolution Path

The architecture supports future evolution:

1. **Database** — Swap in-memory → Prisma without changing services
2. **Microservices** — Extract modules along existing boundaries
3. **Event sourcing** — Domain events abstraction already exists
4. **CQRS** — Read/write separation possible per module

Architecture is a **living document** that evolves with the system.
