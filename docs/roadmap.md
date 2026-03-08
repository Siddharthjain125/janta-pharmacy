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
| Phase 6 | Payments & Notifications | 🚧 In Progress |
| Phase 7 | Fulfilment & Shipping | ⏳ Planned |
| Phase 8 | Admin Operations Panel | ⏳ Planned |
| Phase 9 | File Storage System | ⏳ Planned |
| Phase 10 | Observability & Monitoring | ⏳ Planned |
| Phase 11 | Background Jobs | ⏳ Planned |
| Phase 12 | Notification Infrastructure | ⏳ Planned |
| Phase 13 | Deployment & Infrastructure | ⏳ Planned |
| Phase 14 | Real Payment Gateway | ⏳ Planned |
| Phase 15 | Security Hardening | ⏳ Planned |
| Phase 16 | Performance & Caching | ⏳ Planned |
| Phase 17 | Documentation & Showcase | ⏳ Planned |

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
| **6** | Manual payments v1: `PaymentIntent` model, COD immediate verification, UPI proof submission and admin verify/reject flow, order detail/payment UI, order transition to `PAID` after verified payment |

**Current State:** Users can browse the catalog (public), add items to cart, place orders, view history, and cancel eligible orders. Profile and address management are available. Fulfilment (ship) is blocked until compliance approval; payment is allowed after confirmation regardless of prescription status. Users can pay via COD or UPI proof submission, and admins verify/reject submitted UPI payments. Login is required for cart/checkout and profile operations.

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

## Phase 6: Payments & Notifications 🚧

**Goal:** Make orders commercially complete.

### Completed (Manual Payments v1)
- [x] `PaymentIntent` domain added (`method`, `status`, `referenceId`, `proofReference`, `verifiedAt`) with Prisma and in-memory repositories.
- [x] User payment APIs on orders:
  - `POST /orders/:id/payment` (COD or UPI intent creation)
  - `POST /orders/:id/payment/upi-proof` (submit UPI proof)
- [x] Payment lifecycle implemented:
  - COD: intent created as `VERIFIED`, order transitions `CONFIRMED` → `PAID`
  - UPI: `PENDING` → `SUBMITTED` (user proof) → `VERIFIED`/`REJECTED` (admin decision)
- [x] Admin verification APIs:
  - `GET /admin/payments/pending`
  - `POST /admin/payments/:id/verify` (marks order as `PAID`)
  - `POST /admin/payments/:id/reject`
- [x] Frontend payment UX:
  - `/orders/[id]/payment` for method selection, UPI instructions, and proof submission
  - Payment status surfaced in order detail/confirmed experiences

### Remaining
- [ ] Real payment gateway integration (Razorpay/Stripe)
- [ ] Webhook-based reconciliation with idempotency guarantees
- [ ] Automated notifications (order confirmation, payment updates, shipping, delivery)

### Why Deferred
Gateway integration, webhook hardening, and notification infra require external services plus operational controls.

---

## Phase 7: Fulfilment & Shipping ⏳

**Goal:** Complete the commercial lifecycle of an order.

### Planned
- [ ] Extend lifecycle: `CONFIRMED -> PAID -> PACKED -> SHIPPED -> DELIVERED` (with optional `RETURNED` and `FAILED_DELIVERY`)
- [ ] Add fulfilment domain (`Shipment` entity with `carrier`, `trackingId`, `shippedAt`, `deliveredAt`)
- [ ] Add `FulfilmentService` and shipment repository contract/implementation
- [ ] Admin APIs for pack/ship/deliver transitions
- [ ] Frontend order timeline reflecting fulfilment states

**Outcome:** Order lifecycle becomes commercially complete end-to-end.

---

## Phase 8: Admin Operations Panel ⏳

**Goal:** Provide an operational interface for pharmacy staff.

### Planned
- [ ] Introduce admin routes and authenticated admin shell (`/admin`)
- [ ] Order dashboard with filters (status, payment status, date range, user)
- [ ] Admin order actions (pack, ship, cancel where allowed)
- [ ] Prescription moderation queue (approve/reject)
- [ ] Payments dashboard for manual verification decisions

**Outcome:** The system becomes operationally usable by internal staff.

---

## Phase 9: File Storage System ⏳

**Goal:** Support real uploads for prescriptions and payment proofs.

### Planned
- [ ] Add storage abstraction (`IFileStorage`)
- [ ] Implement `LocalDiskStorage` first, keep `S3Storage` pluggable
- [ ] Add upload/retrieval APIs (including pre-signed URL strategy where relevant)
- [ ] Store file metadata in DB, keep binary files external

**Outcome:** Enables production-grade document workflows.

---

## Phase 10: Observability & Monitoring ⏳

**Goal:** Understand system behavior in production.

### Planned
- [ ] Structured logging with consistent correlation fields (`requestId`, `userId`, `orderId`, `eventType`)
- [ ] Metrics endpoint (`/metrics`) with key counters and latency metrics
- [ ] Optional tracing integration (OpenTelemetry-compatible)

**Outcome:** System health and behavior become measurable and diagnosable.

---

## Phase 11: Background Jobs ⏳

**Goal:** Move non-critical work off the request thread.

### Planned
- [ ] Introduce queue abstraction for asynchronous processing
- [ ] Add Redis-backed worker setup (e.g., BullMQ)
- [ ] Move notifications, reminders, and reconciliation tasks to jobs
- [ ] Define retry, idempotency, and dead-letter handling patterns

**Outcome:** Improved responsiveness and reliability under load.

---

## Phase 12: Notification Infrastructure ⏳

**Goal:** Notify users on important lifecycle events.

### Planned
- [ ] Build `NotificationService` with template-driven messages
- [ ] Support initial channels (email, SMS), keep WhatsApp/future channels extensible
- [ ] Emit notifications for `OrderConfirmed`, `PaymentVerified`, `OrderShipped`, and compliance outcomes
- [ ] Add delivery status tracking and retry semantics

**Outcome:** Stronger customer communication and lifecycle transparency.

---

## Phase 13: Deployment & Infrastructure ⏳

**Goal:** Run the platform in reproducible real environments.

### Planned
- [ ] Dockerize API, frontend, database, and queue/cache dependencies
- [ ] Standardize local orchestration via `docker-compose`
- [ ] Define first cloud target and deployment workflow (preview + production)
- [ ] Add environment configuration and secret management baseline

**Outcome:** Public demo and repeatable deployments become practical.

---

## Phase 14: Real Payment Gateway ⏳

**Goal:** Replace manual verification with gateway-native flows.

### Planned
- [ ] Integrate a real gateway (Razorpay or Stripe)
- [ ] Implement payment order creation, redirect/intent flow, webhook verification
- [ ] Enforce idempotency keys and webhook signature validation
- [ ] Add replay protection and reconciliation tooling

**Outcome:** Real commercial payment support with safer automation.

---

## Phase 15: Security Hardening ⏳

**Goal:** Establish a production security baseline.

### Planned
- [ ] Rate limiting and abuse controls
- [ ] Stronger login protection and brute-force mitigation
- [ ] Security headers (`helmet`), tightened CORS, and CSRF strategy
- [ ] Expanded input validation and threat-focused audits

**Outcome:** Better protection against common web and auth attack vectors.

---

## Phase 16: Performance & Caching ⏳

**Goal:** Improve scalability and latency.

### Planned
- [ ] Introduce Redis caching for catalog-heavy read paths
- [ ] Add HTTP cache semantics (`ETag`, `Cache-Control`) for suitable endpoints
- [ ] Define cache invalidation strategy for product/catalog updates

**Outcome:** Better throughput and faster user-facing responses.

---

## Phase 17: Documentation & Showcase ⏳

**Goal:** Turn the project into a portfolio-grade architecture reference.

### Planned
- [ ] Consolidate architecture, domain model, and state-machine docs
- [ ] Maintain ADR index with implementation mapping
- [ ] Publish deployment and operations guides
- [ ] Provide stable demo environment and sample user journeys

**Outcome:** Project is easier to evaluate, operate, and showcase.

---

## Final System Architecture (Target)

When complete, the platform includes:
- Auth
- Catalog
- Orders
- Payments
- Compliance
- Fulfilment
- Notifications
- Admin Operations
- File Storage
- Observability
- Background Jobs
- Deployment

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
