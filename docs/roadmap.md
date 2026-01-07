# Janta Pharmacy — Implementation Roadmap

This roadmap reflects an **architecture-first, risk-driven** development approach.

The system is evolved by validating complexity early, proving architectural decisions under real domain stress, and only then expanding user-facing functionality.

> **The goal is not speed, but correctness, evolvability, and production realism.**

---

## Progress Summary

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 0 | Architecture Blueprint | ✅ Complete |
| Phase 0.5 | Core Domain Validation | ✅ Complete |
| Phase 1 | Identity & Access | ✅ Complete |
| Phase 2 | Catalog Browsing | ✅ Complete |
| Phase 3A | Cart (Draft Order) | ✅ Complete |
| Phase 3B | Checkout & Order History | 🔜 Next |
| Phase 4 | Prescription Workflow | ⏳ Planned |
| Phase 5 | Payments & Notifications | ⏳ Planned |

---

## Phase 0: Architecture Blueprint ✅

**Goal:** Design the system before committing to tools or features.

### Completed
- System context & bounded contexts
- Modular monolith architecture decision
- Module ownership & data boundaries
- Transaction & consistency rules
- Security, audit logging, observability strategy

**Outcome:** Production-grade blueprint before writing code.

---

## Phase 0.5: Core Domain Validation ✅

**Goal:** Validate architecture against the hardest domain problems first.

This phase was intentionally executed before user-facing features to reduce architectural risk.

### Completed
- Order domain model with explicit lifecycle
- State machine enforcing valid transitions (DRAFT → CREATED → CONFIRMED → PAID → SHIPPED → DELIVERED)
- Command-style APIs (confirm, pay, cancel)
- Domain-specific error taxonomy
- Ownership & authorization enforcement
- Structured logging with correlation IDs
- In-memory repositories with clear contracts

### Why This Phase Exists

| Reason | Impact |
|--------|--------|
| Orders are the most complex workflow | Validates core patterns early |
| Proves consistency boundaries | Prevents late-stage refactors |
| Domain events abstraction | No infrastructure lock-in |

**Outcome:** Architecture proven under real complexity, not toy CRUD.

---

## Phase 1: Identity & Access ✅

**Goal:** Establish real user identity as the foundation for all features.

### Backend
- [x] User entity with phone-based identity
- [x] Registration (`POST /auth/register`)
- [x] Login with JWT (`POST /auth/login`)
- [x] Password hashing (bcrypt)
- [x] Refresh token flow with rotation
- [x] Auth guards wired to real users
- [x] Role-based access control

### Frontend
- [x] Login & registration pages
- [x] AuthContext with token management
- [x] Token storage & automatic refresh
- [x] Protected routes
- [x] Session persistence across reloads

**Outcome:** Full authentication flow with JWT + refresh token rotation.

---

## Phase 2: Catalog Browsing ✅

**Goal:** Expose a browseable, searchable medicine catalog.

### Backend
- [x] Product entity with value objects (ProductId, Money)
- [x] ProductCategory enum with metadata
- [x] InMemoryProductRepository with sample data
- [x] CatalogQueryService for queries
- [x] Listing with pagination
- [x] Search by name/description
- [x] Filter by category & prescription requirement
- [x] Clean DTO boundaries

### Frontend
- [x] Product listing page (`/catalog`)
- [x] Category filter, search input, prescription toggle
- [x] Pagination controls
- [x] URL state persistence
- [x] Product detail page (`/catalog/[id]`)
- [x] Loading, empty, error states

**Outcome:** Full catalog browsing with search, filtering, pagination.

---

## Phase 3A: Cart (Draft Order) ✅

**Goal:** Implement shopping cart as Draft Order domain model.

### Design Decision: Cart = Draft Order

The cart is **not** a separate entity. It is an Order in `DRAFT` state.

| Approach | Why Chosen |
|----------|------------|
| Reuses Order domain | Single source of truth for order items |
| Natural lifecycle | DRAFT → CREATED on checkout |
| Consistent invariants | Same rules apply to cart and order |

### Backend
- [x] OrderItem domain entity with price snapshot
- [x] Draft Order (Order in DRAFT state)
- [x] CartService with command-style use cases:
  - createDraftOrder
  - addItemToCart
  - updateItemQuantity
  - removeItemFromCart
- [x] Invariants enforced:
  - One active draft per user
  - Only DRAFT orders are mutable
  - Ownership checks
  - Quantity > 0
  - Unit price captured at add-time
- [x] CartController (`/cart` endpoints)
- [x] Comprehensive tests

### Frontend
- [x] Add to Cart from catalog listing
- [x] Add to Cart from product detail
- [x] Cart page (`/cart`) with:
  - Item list (name, price, quantity, subtotal)
  - Quantity controls (increment/decrement)
  - Remove item
  - Order total
- [x] Loading, empty, error states
- [x] Cart link in navigation

**Outcome:** Shopping cart backed by Draft Order domain model.

---

## Phase 3B: Checkout & Order History 🔜

**Goal:** Complete the order flow from cart to placed order.

### Backend (Planned)
- [ ] Checkout command (DRAFT → CREATED)
- [ ] Order history query with pagination
- [ ] Prescription-required product handling

### Frontend (Planned)
- [ ] Checkout flow
- [ ] Order confirmation
- [ ] Order history page
- [ ] Order detail page
- [ ] Cancel order flow

**Outcome:** User can place orders and view history.

---

## Phase 4: Prescription Workflow ⏳

**Goal:** Support regulated medicine workflows.

- [ ] Prescription entity
- [ ] Upload and review lifecycle
- [ ] Prescription-order linkage
- [ ] Admin approval UI

---

## Phase 5: Payments & Notifications ⏳

**Goal:** Make orders commercially complete.

- [ ] Payment gateway integration
- [ ] Webhook handling
- [ ] Email/SMS notifications

---

## Intentionally Deferred

The following are **explicitly deferred** until justified by requirements:

| Item | Rationale |
|------|-----------|
| Database (PostgreSQL) | Domain must stabilize first |
| Infrastructure (Terraform, K8s) | No deployment target yet |
| Mobile app | Web-first validation |
| Admin dashboard | Core flows first |
| Performance optimization | Premature before scale |

---

## Roadmap Principles

1. **Architecture before features** — Design decisions precede implementation
2. **Risk before convenience** — Tackle hard problems early
3. **Domain correctness over speed** — Get the model right first
4. **Infrastructure only when justified** — No premature optimization
5. **Every phase leaves the system evolvable** — No dead ends
