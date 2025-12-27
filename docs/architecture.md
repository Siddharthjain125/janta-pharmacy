# System Architecture – Janta Pharmacy

## 1. Overview

Janta Pharmacy is a digital platform designed to enable customers to
search medicines, upload prescriptions, place orders, and track delivery,
while allowing pharmacy administrators to manage inventory, orders, and compliance.

This document describes the **architectural decisions**, **constraints**,
and **high-level system structure**.  
Implementation details are intentionally deferred.

The goal is to design a system that is:
- Production-ready
- Maintainable by a small team
- Cost-efficient in early stages
- Capable of evolving as scale and complexity grow

---

## 2. Problem Statement

The platform must support:
- Medicine discovery and availability checks
- Prescription-based ordering
- Order placement and payment
- Auditability for regulated workflows
- Administrative control over inventory and orders

The system must prioritize **correctness, traceability, and clarity**
over premature optimization.

---

## 3. Primary Users

- **Customers**
  - Browse medicines
  - Upload prescriptions
  - Place and track orders

- **Pharmacy Admin**
  - Manage catalog and inventory
  - Review prescriptions
  - Process and fulfill orders

- **Delivery Staff (Future)**
  - View assigned deliveries
  - Update delivery status

---

## 4. Non-Goals

To avoid over-engineering, the following are explicitly out of scope
for the initial versions:

- Supporting multiple pharmacies or franchises
- Multi-country or multi-currency support
- Ultra-low latency optimization
- Massive scale (10M+ users)
- Fully automated prescription validation

These can be revisited as the product matures.

---

## 5. Constraints

- Small engineering team (1–3 developers initially)
- Regulated domain where auditability matters
- Cost-sensitive infrastructure
- AI-assisted development workflow
- Public codebase used as a portfolio and reference

All architectural decisions are evaluated against these constraints.

---

## 6. Architectural Style Decision

### Chosen Approach: Modular Monolith

The system will be built as a **modular monolith**:
- A single deployable backend
- Clear internal module boundaries
- Strong separation of concerns

#### Why a Modular Monolith?
- Faster development and iteration for a small team
- Simpler debugging and observability
- Easier transactional consistency
- Lower operational and infrastructure overhead
- Enables future extraction into microservices if needed

#### Why Not Microservices (Yet)?
- Adds operational complexity too early
- Requires mature DevOps and monitoring practices
- Increases cognitive load for a small team
- Slows down early-stage feature delivery

This decision prioritizes **timing over trends**.

---

## 7. High-Level System Components

### Client Applications
- Web application (customer + admin)
- Mobile application (future)

### Backend Application
A single backend application exposing APIs and encapsulating
all business logic.

### Data Store
- Central relational database (initially)
- Clear data ownership per module

### External Integrations (Future)
- Payment gateway
- Notification providers (SMS / Email)
- Delivery partners

---

## 8. Core Backend Modules

The backend is organized into logical modules.
Each module owns:
- Its business rules
- Its data
- Its public interfaces

### Identified Modules
- User Management
- Catalog & Inventory
- Orders
- Payments
- Prescriptions
- Notifications
- Admin Operations

Modules communicate via well-defined interfaces,
not shared internal state.

---

## 9. Data Ownership & Boundaries

- Each module is responsible for its own data model
- Cross-module access is mediated through service interfaces
- No direct table-level coupling across modules

This ensures:
- Clear responsibility boundaries
- Easier refactoring
- Future service extraction readiness

---

## 10. Transaction & Consistency Strategy

- Transactions are scoped within module boundaries
- Cross-module workflows are coordinated at the application layer
- Event-based patterns may be introduced later if complexity grows

Consistency is favored over availability in critical workflows
(e.g., order placement, prescription validation).

---

## 11. Security & Auditability (High-Level)

- Authentication and authorization enforced at the backend
- Role-based access control for admin operations
- Audit logs for:
  - Prescription actions
  - Order lifecycle changes
  - Inventory updates

Detailed security design is documented separately.

---

## 12. AI-Assisted Development Philosophy

AI tools are used to:
- Accelerate boilerplate generation
- Assist with refactoring and documentation
- Speed up experimentation

AI does **not**:
- Make architectural decisions
- Define business rules
- Override explicit design intent

Human judgment remains the source of truth.

---

## 13. What Comes Next

This architecture will be refined incrementally through:
- System context diagrams
- Infrastructure and deployment decisions
- Cost modeling
- Security and compliance detailing

Architecture is treated as a **living document**,
not a one-time exercise.