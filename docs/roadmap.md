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
| Phase 1 | Identity & Access | 🔜 Next | ✅ Demo 1 |
| Phase 2 | Catalog | ⏳ Planned | ✅ Demo 2 |
| Phase 3 | Order Completion | ⏳ Planned | ✅ Demo 3 |
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

## Phase 1: Identity & Access 🔜

> **Status:** Next Up

**Goal:** Establish real user identity as the foundation for all features.

### Backend

- [ ] User entity & repository
- [ ] Registration (`POST /auth/register`)
- [ ] Login with JWT (`POST /auth/login`)
- [ ] Password hashing (bcrypt)
- [ ] Refresh token flow
- [ ] Auth guards wired to real users

### Frontend

- [ ] Login & registration pages
- [ ] Replace mock AuthContext
- [ ] Token storage & refresh handling
- [ ] Auth-based routing & redirects
- [ ] Logout flow

### 🎯 Demo 1

> User can register, login, see their identity, and logout.

**Why now:** Orders, catalog, prescriptions, and payments all depend on real identity.

---

## Phase 2: Catalog Management

**Goal:** Expose a browseable, searchable medicine catalog.

### Backend

- [ ] Product entity (OTC / prescription-required)
- [ ] Category entity
- [ ] Product listing with pagination
- [ ] Search & filtering APIs

### Frontend

- [ ] Product listing page
- [ ] Category sidebar
- [ ] Search bar
- [ ] Product detail page

### 🎯 Demo 2

> Logged-in user can browse and search medicines.

---

## Phase 3: Order Completion

**Goal:** Turn the validated order domain into a full user flow.

### Backend

- [ ] OrderItem entity
- [ ] Add/remove items
- [ ] Order total calculation
- [ ] User & catalog integration
- [ ] Order history with pagination

### Frontend

- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order summary
- [ ] Order history & details
- [ ] Cancel order flow
- [ ] Order status visualization

### 🎯 Demo 3

> User can add items, place orders, view history, cancel eligible orders.

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

| Demo | After Phase | What User Can Do |
|------|-------------|------------------|
| **Demo 1** | Phase 1 | Register, login, see identity, logout |
| **Demo 2** | Phase 2 | Browse and search medicine catalog |
| **Demo 3** | Phase 3 | Add to cart, place order, view history |
| **Demo 4** | Phase 4 | Upload prescription, admin approval flow |
| **Demo 5** | Phase 5 | Pay for order, receive confirmation |
| **Demo 6** | Phase 6 | Admin: manage inventory, view orders |

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
