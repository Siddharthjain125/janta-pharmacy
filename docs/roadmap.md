## 🗺️ Feature Implementation Roadmap

This roadmap outlines how **Janta Pharmacy** will be built incrementally,
aligning implementation with architecture, constraints, and real-world priorities.

The focus is on **clarity, correctness, and evolution**, not rushing features.

---

### Phase 0: Architecture & Foundation ✅
**Status:** Completed

- System context & boundaries
- Modular monolith architecture
- Data ownership per module
- Transaction & consistency rules
- Infrastructure assumptions & cost ranges
- Security, audit logging, and observability
- API interaction style

**Outcome:**  
A production-grade blueprint before writing code.

---

### Phase 1: Platform Skeleton (Weeks 1–2)

**Backend**
- Project setup with module boundaries
- Health check endpoint
- Authentication scaffolding
- Global error handling
- Structured logging with correlation IDs

**Frontend**
- Application shell
- Authentication flow
- Role-based routing

**Outcome:**  
A running system with no business logic, ready for real features.

---

### Phase 2: User & Catalog Management (Weeks 3–4)

- User registration and login
- Role-based access control
- Medicine catalog browsing
- Inventory visibility (read-only)

**Architectural focus:**  
Authorization enforcement and clean module separation.

**Outcome:**  
Users can securely browse available medicines.

---

### Phase 3: Order Placement (Weeks 5–6)

- Order creation
- Order items management
- Order lifecycle states
- Order history

**Architectural focus:**  
Transaction boundaries, idempotency, and state transitions.

**Outcome:**  
End-to-end order placement without payments.

---

### Phase 4: Prescription Workflow (Weeks 7–8)

- Prescription upload
- Admin review and approval
- Prescription-order linking

**Architectural focus:**  
Audit logging, strong consistency, and secure document handling.

**Outcome:**  
Regulated workflows become first-class citizens.

---

### Phase 5: Payments & Notifications (Weeks 9–10)

- Payment initiation
- Payment status handling
- Order updates based on payment outcome
- SMS / Email notifications

**Architectural focus:**  
Async workflows, external system isolation, failure handling.

**Outcome:**  
Orders become commercially complete.

---

### Phase 6: Admin Operations & Observability (Weeks 11–12)

- Inventory management
- Admin dashboards
- Audit log access
- Operational metrics and alerts

**Architectural focus:**  
Operability, monitoring, and controlled access.

**Outcome:**  
System is operable, monitorable, and support-ready.

---

### Phase 7: Hardening & Evolution (Ongoing)

- Performance optimizations
- Caching where justified
- Background jobs
- Delivery partner integration
- API versioning refinements

**Outcome:**  
System evolves based on real usage and metrics.

---

### Roadmap Principles

- Architecture drives implementation
- Features are delivered incrementally
- Complexity is introduced only when justified
- Every phase leaves the system deployable
