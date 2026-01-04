# 🗺️ Janta Pharmacy – Architecture-First Implementation Roadmap

This roadmap reflects an **architecture-first, risk-driven** development approach.

Instead of building features in UI order, the system is evolved by validating
complexity early, proving architectural decisions under real domain stress,
and only then expanding user-facing functionality.

> **The goal is not speed, but correctness, evolvability, and production realism.**

---

## 📊 High-Level Progress Summary

| Phase | Focus Area | Status | Demo Ready |
|-------|------------|--------|------------|
| Phase 0 | Architecture Blueprint | ✅ Complete | N/A |
| Phase 0.5 | Core Domain Validation | ✅ Complete | ❌ |
| Phase 1 | Identity & Access | ✅ Complete | ✅ Demo 1 |
| Phase 2 | Catalog | ✅ Complete | ✅ Demo 2 |
| Phase 3 | Order Completion | 🔜 Next | ✅ Demo 3 |
| Phase 4 | Prescription Workflow | ⏳ Planned | ✅ Demo 4 |
| Phase 5 | Payments & Notifications | ⏳ Planned | ✅ Demo 5 |
| Phase 6 | Admin & Operability | ⏳ Planned | ✅ Demo 6 |
| Phase 7 | Hardening & Evolution | 🔁 Ongoing | — |

---

## Phase 0: Architecture & Foundation ✅

**Goal:** Design the system before committing to tools, infrastructure, or features.

### Completed

- ✅ System context & bounded contexts
- ✅ Modular monolith architecture
- ✅ Module ownership & data boundaries
- ✅ Transaction & consistency rules
- ✅ Sync vs async interaction strategy
- ✅ Security, audit logging, observability strategy
- ✅ Infra assumptions & cost ranges
- ✅ Feature roadmap & evolution plan

**Outcome:** A production-grade blueprint before writing real code.

---

## Phase 0.5: Core Domain Validation ✅

> *Intentional Early Step*

**Goal:** Validate the architecture against the hardest domain problems first.

This phase was intentionally executed before user-facing features to reduce
architectural risk.

### Completed

- ✅ Order domain model with explicit lifecycle
- ✅ State machine enforcing valid transitions
- ✅ Command-style APIs (confirm, pay, cancel)
- ✅ Domain-specific error taxonomy
- ✅ Ownership & authorization enforcement
- ✅ Structured logging with correlation IDs
- ✅ Domain events abstraction (no infrastructure)
- ✅ In-memory repositories with clear contracts

### Why This Phase Exists

| Reason | Impact |
|--------|--------|
| Orders represent the most complex workflow | Validates core patterns |
| Validates consistency boundaries early | Prevents late-stage refactors |
| Proves the system can evolve without rewrites | Future-proofs architecture |
| Enables future async workflows | No infrastructure lock-in |

**Outcome:** Architecture proven under real complexity, not toy CRUD.

---

## Phase 1: Identity & Access ✅

> **Status:** Complete

**Goal:** Establish real user identity as the foundation for all features.

### Backend

- [x] User entity & repository
- [x] Registration (`POST /auth/register`)
- [x] Login with JWT (`POST /auth/login`)
- [x] Password hashing (bcrypt)
- [x] Refresh token flow with rotation
- [x] Auth guards wired to real users
- [x] Role-based access control

### Frontend

- [x] Login & registration pages
- [x] Real AuthContext with token management
- [x] Token storage & automatic refresh handling
- [x] Auth-based routing & protected routes
- [x] Logout flow
- [x] Session persistence across page reloads

### 🎯 Demo 1

> User can register, login, see their identity, and logout.

**Outcome:** Full authentication flow with JWT + refresh token rotation, protected routes, and session persistence.

---

## Phase 2: Catalog Management ✅

> **Status:** Complete

**Goal:** Expose a browseable, searchable medicine catalog.

### Backend

- [x] Product entity with value objects (ProductId, Money)
- [x] ProductCategory enum with metadata
- [x] ProductRepository interface (read-only)
- [x] InMemoryProductRepository with sample data
- [x] CatalogQueryService for application-level queries
- [x] Product listing with pagination
- [x] Search by name/description (case-insensitive)
- [x] Filter by category & prescription requirement
- [x] Combined filters with pagination
- [x] Clean DTO boundaries (no domain leakage)
- [x] Automated tests for query behavior

### Frontend

- [x] Product listing page (`/catalog`)
- [x] Category filter dropdown
- [x] Search input with real-time filtering
- [x] Prescription-required toggle
- [x] Pagination controls (Next/Previous)
- [x] URL state persistence (shareable/reload-safe)
- [x] Product detail page (`/catalog/[id]`)
- [x] Loading, empty, and error states

### 🎯 Demo 2

> Logged-in user can browse, search, filter, and paginate medicines.

**Outcome:** Full catalog browsing with search, filtering, pagination, and URL state management.

---

## Phase 3: Order Completion 🔜

> **Status:** Next Up

**Goal:** Turn the validated order domain into a full user flow.

### Backend

- [ ] OrderItem entity with product reference
- [ ] Cart / draft order management
- [ ] Add/remove items from order
- [ ] Order total calculation (integrate with Money)
- [ ] User & catalog integration
- [ ] Order history with pagination
- [ ] Prescription-required product handling

### Frontend

- [ ] Shopping cart (add to cart from catalog)
- [ ] Cart page with item management
- [ ] Checkout flow
- [ ] Order summary
- [ ] Order history & details pages
- [ ] Cancel order flow
- [ ] Order status visualization (state machine states)

### 🎯 Demo 3

> User can add items, place orders, view history, cancel eligible orders.

**Why now:** Order domain model already validated in Phase 0.5. This phase wires it to real users and catalog.

---

## Phase 4: Prescription Workflow

**Goal:** Support regulated medicine workflows.

### Backend

- [ ] Prescription entity
- [ ] Upload endpoint
- [ ] Review lifecycle (pending → approved/rejected)
- [ ] Prescription-order linkage
- [ ] Admin approval endpoints

### Frontend

- [ ] Prescription upload
- [ ] Status tracking
- [ ] Admin review UI

### 🎯 Demo 4

> Prescription medicines require admin approval before order confirmation.

---

## Phase 5: Payments & Notifications

**Goal:** Make orders commercially complete.

### Backend

- [ ] Payment gateway integration
- [ ] Payment initiation
- [ ] Webhook handling
- [ ] Order state updates
- [ ] Email / SMS notifications

### Frontend

- [ ] Payment flow
- [ ] Success / failure pages
- [ ] Notification preferences

### 🎯 Demo 5

> User can pay and receive confirmations.

---

## Phase 6: Admin Operations & Observability

**Goal:** Make the system operable in production.

### Backend & Frontend

- [ ] Inventory management
- [ ] Admin dashboards
- [ ] Audit log viewer
- [ ] Metrics & health endpoints
- [ ] Access-controlled admin UI

### 🎯 Demo 6

> Admins can operate and monitor the system.

---

## Phase 7: Hardening & Evolution

> **Status:** Ongoing

- [ ] Performance profiling
- [ ] Caching strategies
- [ ] Background processing
- [ ] Delivery integrations
- [ ] API versioning
- [ ] Rate limiting refinement

---

## 🎬 Demo Timeline

| Demo | After Phase | What User Can Do | Status |
|------|-------------|------------------|--------|
| **Demo 1** | Phase 1 | Register, login, see identity, logout | ✅ Ready |
| **Demo 2** | Phase 2 | Browse, search, filter medicine catalog | ✅ Ready |
| **Demo 3** | Phase 3 | Add to cart, place order, view history | 🔜 Next |
| **Demo 4** | Phase 4 | Upload prescription, admin approval flow | ⏳ Planned |
| **Demo 5** | Phase 5 | Pay for order, receive confirmation | ⏳ Planned |
| **Demo 6** | Phase 6 | Admin: manage inventory, view orders | ⏳ Planned |

---

## Roadmap Principles

1. **Architecture before features** – Design decisions precede implementation
2. **Risk before convenience** – Tackle hard problems early
3. **Domain correctness over speed** – Get the model right first
4. **Infrastructure only when justified** – No premature optimization
5. **Every phase leaves the system evolvable** – No dead ends
6. **Demos validate progress** – Not vanity metrics

---

## Final Architect Note

> The system intentionally validates complexity early (Orders, state machines,
> domain events) before completing user-facing flows.
>
> **This reflects how production systems are designed, not how tutorials are written.**
