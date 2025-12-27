# API Interaction Style – Janta Pharmacy

## Purpose

This document defines how APIs are designed and how interactions
occur between client applications, backend modules, and external systems.

The goal is to ensure clarity, consistency, predictable behavior,
and maintainable communication patterns across the system.

---

## Design Philosophy

API design favors:
- Explicit contracts over implicit behavior
- Predictability over cleverness
- Simplicity in early stages
- Evolution without breaking consumers

The system intentionally avoids unnecessary complexity
such as premature event-driven or distributed architectures.

---

## Guiding Principles

- Prefer synchronous interactions for core workflows
- Use asynchronous interactions only when latency or reliability demands it
- APIs should be explicit, versioned, and backward compatible
- Failures must be visible and diagnosable
- Clients are treated as untrusted

---

## Client to Backend Interaction

Client applications (web and mobile) interact with the backend
using synchronous, request–response APIs.

### Characteristics
- REST-style HTTP APIs
- JSON request and response payloads
- Stateless interactions
- Clear and consistent HTTP status codes

### Backend Responsibilities
- Enforce all business rules
- Validate input data
- Perform authorization checks
- Coordinate cross-module workflows

Business logic never resides in client applications.

---

## Backend Module Interaction

Backend modules communicate synchronously through
well-defined service interfaces within the same application.

### Characteristics
- In-process method calls
- Explicit request and response models
- No shared mutable state

### Constraints
- Modules do not directly access each other’s data stores
- Cross-module communication occurs only through service interfaces
- Internal APIs follow the same discipline as external APIs

This approach maintains clear boundaries while avoiding
distributed system complexity.

---

## Asynchronous Interactions

Asynchronous communication is used selectively
for workflows that should not block user-facing requests
or that depend on external systems.

### Suitable Use Cases
- Payment status updates
- Notification delivery (SMS / Email)
- Inventory reconciliation
- Audit log export and analytics

### Interaction Model
- Events are emitted after successful transactions
- Consumers process events independently
- Event handlers are idempotent
- Failures are retried or logged without corrupting core state

Asynchronous flows are additive and never replace
critical synchronous validation.

---

## External System Interaction

External systems are integrated using synchronous APIs
with asynchronous callbacks where applicable.

### Examples
- Payment gateways via API calls and webhook callbacks
- Notification providers via fire-and-forget requests
- Delivery partners via status update APIs

### Reliability Rules
- External failures do not corrupt internal state
- Timeouts and retries are explicitly handled
- External dependencies are isolated behind service abstractions

---

## API Versioning Strategy

- All APIs are explicitly versioned (e.g., `/api/v1`)
- Breaking changes result in new API versions
- Backward compatibility is maintained when feasible
- Deprecated versions are phased out with clear communication

This enables safe evolution of the platform.

---

## Error Handling Contract

APIs return consistent and structured error responses.

### Error Response Structure
- Error code
- Human-readable message
- Machine-readable identifier
- Correlation ID (for tracing)

### Error Categories
- Client errors (4xx): invalid input, unauthorized access
- Server errors (5xx): unexpected failures, dependency issues

Errors are logged centrally and linked to request context
to support effective debugging.

---

## Idempotency & Retries

- Idempotency keys are used for operations like order placement
- Retried requests do not cause duplicate state changes
- Safe retries are supported where applicable

This prevents data corruption in failure scenarios.

---

## What We Explicitly Avoid

- Chatty or tightly coupled APIs
- Implicit side effects across modules
- Long-running synchronous requests
- Distributed transactions
- Shared schemas across bounded contexts

These constraints protect the system from
hidden complexity and operational fragility.

---

## Evolution Path

As the platform grows:
- Select workflows may transition to event-driven models
- Async processing may expand for scalability
- External APIs may be exposed for partner integrations

These changes will build upon existing contracts,
not replace them.

---

## Summary

The API interaction model prioritizes:
- Clarity over abstraction
- Reliability over novelty
- Evolution over premature optimization

This approach enables rapid development today while keeping future architectural options open.
