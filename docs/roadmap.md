# Janta Pharmacy — Implementation Roadmap

An **architecture-first, risk-driven** development approach. Complexity is validated early, architectural decisions are proven under real domain stress, then user-facing features are added.

> **The goal is not speed, but correctness, evolvability, and production realism.**

---

## Progress Summary

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 0 | Architecture Blueprint | ✅ Complete |
| Phase 0.5 | Core Domain Validation | ✅ Complete |
| Phase 1 | Identity & Access | ✅ Complete |
| Phase 2 | Catalog Browsing | ✅ Complete |
| Phase 3 | Order Completion | ✅ Complete |
| Phase 3+ | UX & Auth Corrections | ✅ Complete |
| Phase 4 | User Profile & Persistence | ✅ Complete |
| Phase 5 | Prescription Workflow | ✅ Complete |
| Phase 5.5 | Compliance Enforcement | ✅ Complete |
| Phase 6 | Payments & Notifications | ⏳ Planned |

---

## What's Done So Far

| Phase | What Was Built |
|-------|----------------|
| **0** | Design documents only — architecture blueprint, bounded contexts, module boundaries |
| **0.5** | First production-style code — order domain, state machine, domain events, repository contracts |
| **1** | Phone-based auth, JWT + refresh tokens, protected routes |
| **2** | Product catalog with search, filtering, pagination, category modeling |
| **3** | Order lifecycle: cart → checkout → history → cancel |
| **3+** | UX refinements, auth flow fixes, shadcn/ui components |
| **4** | User profile read & mutation APIs, address aggregate, PostgreSQL + Prisma, Prisma and in-memory repositories, user context composition, frontend profile and addresses pages |
| **5** | Prescription aggregate, admin review, order–prescription/consultation links, compliance gate at fulfilment |
| **5.5** | Compliance enforcement: fulfilment gated by prescription/consultation approval; payment explicitly allowed before approval (ADR-0055) |

**Current State:** Users can browse the catalog (public), add items to cart, place orders, view history, and cancel eligible orders. Profile and address management are available. Fulfilment (ship) is blocked until compliance approval; payment is allowed after confirmation regardless of prescription status. Login is required for cart/checkout and profile operations.

---

## Phase 0: Architecture Blueprint ✅

**Goal:** Design the system before writing code.

This phase produced **design documents only** — no application code was written.

### Completed
- [x] System context diagram with bounded contexts
- [x] Modular monolith architecture decision
- [x] Module ownership matrix (Auth, Catalog, Orders)
- [x] Data boundary definitions
- [x] Security strategy (JWT, RBAC, ownership enforcement)
- [x] Logging and observability approach

### Key Documents
- [x] `docs/architecture.md` — Architecture overview
- [x] `docs/decisions/` — Architecture Decision Records

**Outcome:** Production-grade blueprint established before implementation.

---

## Phase 0.5: Core Domain Validation ✅

**Goal:** Write the first real code against the hardest domain problem.

This phase produced the **first production-style code** — validating architecture under real complexity before user-facing features.

### Order Domain Model
- [x] `Order` aggregate with explicit lifecycle states
- [x] `OrderItem` entity with price snapshot
- [x] `Money` value object for currency-safe arithmetic
- [x] `OrderStatus` enum with defined states

**Active states (implemented):** DRAFT, CONFIRMED, CANCELLED  
**Designed states (not yet implemented):** PAID, SHIPPED, DELIVERED

### State Machine
- [x] `order-state-machine.ts` — Single source of truth for transitions
- [x] `canTransition(from, to)` — Validates state changes
- [x] No direct state mutation; all changes through state machine

### Command-Style APIs
- [x] `confirmOrder()` — DRAFT → CONFIRMED
- [x] `cancelOrder()` — Cancellable states → CANCELLED
- [x] Commands enforce ownership, validate state, emit events

### Domain Events
- [x] `OrderConfirmedEvent`, `OrderCancelledEvent`
- [x] In-process event collection (no messaging infrastructure)

### Repository Contracts
- [x] `IOrderRepository` interface
- [x] `InMemoryOrderRepository` implementation
- [x] Domain logic is persistence-agnostic

**Outcome:** Architecture proven under real complexity. State machine and event patterns established.

---

## Phase 1: Identity & Access ✅

**Goal:** Establish real user identity as foundation for all features.

### Backend
- [x] `User` entity with phone-based identity
- [x] `POST /auth/register`, `/login`, `/refresh`, `/logout`
- [x] Password hashing (bcrypt), JWT tokens, refresh token rotation
- [x] `JwtAuthGuard`, `RolesGuard`, `@CurrentUser()` decorator
- [x] Correlation ID propagation, structured logging

### Frontend
- [x] `AuthProvider` with `useAuth()` hook
- [x] Token management with automatic refresh
- [x] `/login`, `/register` pages
- [x] `ProtectedRoute` component

**Outcome:** Full JWT + refresh token authentication flow.

---

## Phase 2: Catalog Browsing ✅

**Goal:** Expose a browseable, searchable medicine catalog.

### Backend
- [x] `Product` entity with value objects (`ProductId`, `Money`)
- [x] `ProductCategory` enum with metadata (read-only, no CRUD)
- [x] `CatalogQueryService` — Read-only queries
- [x] `GET /catalog/products` — Paginated list with filters
- [x] `GET /catalog/products/:id`, `GET /catalog/categories`
- [x] Search, category filter, prescription filter, pagination

### Frontend
- [x] `/catalog` — Product grid with search, filters, pagination
- [x] `/catalog/[id]` — Product detail page
- [x] URL state persistence for filters

**Outcome:** Full catalog browsing with search, filtering, pagination.

---

## Phase 3: Order Completion ✅

**Goal:** Implement order lifecycle from cart to cancellation.

### Design Decision: Cart = Draft Order

The cart is an Order in `DRAFT` state — not a separate entity.

| Approach | Rationale |
|----------|-----------|
| Reuses Order domain | Single source of truth |
| Natural lifecycle | DRAFT → CONFIRMED on checkout |
| Consistent invariants | Same rules for cart and order |

### Backend
- [x] `CartService` — createDraft, addItem, updateQuantity, removeItem, confirm
- [x] `/cart` endpoints — GET, POST, PATCH, DELETE
- [x] `POST /orders/checkout` — Confirm draft order
- [x] `GET /orders`, `GET /orders/:id` — History and detail
- [x] `POST /orders/:id/cancel` — Cancel order
- [x] Domain events emitted on confirm/cancel
- [x] Invariants: one draft per user, ownership checks, quantity > 0

### Frontend
- [x] Add to cart from catalog
- [x] `/cart` — Item list, quantity controls, checkout
- [x] `/orders` — Order history with pagination
- [x] `/orders/[id]` — Order detail with cancel action

**Outcome:** Users can add items, checkout, view history, and cancel orders. State-machine–driven lifecycle.

---

## Phase 3+: UX & Auth Corrections ✅

**Goal:** Improve usability without changing domain logic.

> **Why this phase exists:** Phase 3+ is a **corrective refinement phase**. It addresses UX issues and auth flow bugs discovered during integration. It intentionally adds **no new domain concepts** — all changes are frontend-only or auth-related fixes.

### Auth Flow Fixes
- [x] Catalog and product pages made public (no login required)
- [x] Login required only for cart/checkout/orders
- [x] Non-blocking login prompt for guests
- [x] Refresh token race condition fix

### Form Improvements
- [x] Correct autofill attributes (`name`, `type`, `autocomplete`, `inputMode`)
- [x] Name field added to registration

### Cart UX
- [x] Quantity controls (`− 1 +`) replace "Add to Cart" once added
- [x] "View Cart" button next to quantity controls
- [x] Header cart icon with item count badge

### Pricing Display (UI-only)
- [x] MRP (strikethrough) — derived in UI from selling price
- [x] Discount percentage — calculated in UI
- [x] Cart summary: Total MRP, Discount, Final Amount
- [x] **No backend pricing logic** — backend total is source of truth

### UI Components
- [x] shadcn/ui: Button, Input, Label, Card, Badge
- [x] Tailwind CSS with CSS variables
- [x] Sticky navigation header

### Explicit Boundaries
- No new backend domain concepts added
- No infrastructure or persistence changes
- Backend remains source of truth for all totals

**Outcome:** Clean UI with correct auth flows. Browsing is public; login enforced only when required.

---

## Phase 4: User Profile & Persistence ✅

**Goal:** Add profile features and transition to persistent storage.

### Completed
- [x] User profile read & mutation APIs (`GET/PATCH /users/me`)
- [x] Address management as a separate aggregate (list, add, update, delete)
- [x] PostgreSQL + Prisma persistence
- [x] Repository implementations (Prisma + in-memory) for all entities
- [x] Read-only user context composition
- [x] Frontend demo pages for profile and addresses

---

## Phase 5: Prescription Workflow ✅

**Goal:** Support regulated medicine workflows.

### Completed
- [x] `Prescription` entity with lifecycle (PENDING → APPROVED/REJECTED)
- [x] Admin review APIs (approve/reject)
- [x] Order–prescription and order–consultation link aggregates (order references compliance artifacts)
- [x] Consultation request aggregate (lifecycle PENDING → APPROVED/REJECTED)
- [x] File storage intentionally deferred; frontend UI planned next

---

## Phase 5.5: Compliance Enforcement ✅

**Goal:** Turn ADR-0055 into enforceable behaviour without changing the order state machine or blocking payment.

### Completed
- [x] **Compliance gate:** `OrderComplianceService` evaluates whether an order may proceed to fulfilment (`canFulfil`, `getComplianceStatus`).
- [x] **Rules:** Order with no prescription-required items → APPROVED. Order with prescription-required items → APPROVED if at least one linked prescription or consultation is APPROVED; REJECTED if explicitly rejected; otherwise PENDING.
- [x] **Fulfilment guard:** Ship (PAID → SHIPPED) calls the compliance gate; fulfilment is blocked with a domain error if not approved.
- [x] **Payment boundary:** Payment logic does not check prescription or consultation status. Payment is allowed after order confirmation regardless of compliance (documented in `PaymentService` and ADR-0055).
- [x] **Rejection and recovery:** Order remains CONFIRMED after compliance rejection; compliance status can change (e.g. new prescription approved) and fulfilment then allowed.

### Design Constraints (unchanged)
- Order state machine unchanged.
- Prescription and consultation remain separate aggregates.
- Compliance is derived, not a new order state.

---

## Phase 6: Payments & Notifications ⏳

**Goal:** Make orders commercially complete.

### Planned
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] CONFIRMED → PAID state transition
- [ ] Webhook handling with idempotency
- [ ] Email notifications (order confirmation, shipping, delivery)

### Why Deferred
Requires external service integration and PCI compliance considerations.

---

## Intentionally Deferred

| Item | Rationale |
|------|-----------|
| Persistent pricing/discounts | UI mock is sufficient; domain must justify complexity |
| Inventory management | Out of scope; assume infinite stock |
| Designer home page | Theming is cosmetic; core UX proven first |
| Infrastructure (Terraform, K8s) | No deployment target defined |
| Mobile app | Web-first validation |
| Admin dashboard | Core customer flows take priority |

---

## Technical Debt & Known Limitations

| Item | Status | Resolution |
|------|--------|------------|
| In-memory repositories | Intentional | Phase 4 |
| No file storage | Intentional | Phase 5 |
| UI-derived MRP | Intentional | Phase 4+ if needed |
| No email verification | Acceptable | Phase 6 |
| Refresh token in localStorage | Accepted risk | Documented |

---

## Roadmap Principles

1. **Architecture before features** — Design precedes implementation
2. **Risk before convenience** — Hard problems first
3. **Domain correctness over speed** — Get the model right
4. **Infrastructure only when justified** — No premature optimization
5. **Honest documentation** — Reality, not aspirations
6. **In-memory until proven** — Persistence after domain stability
