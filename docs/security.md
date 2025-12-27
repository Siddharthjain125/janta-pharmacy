# Security & Audit Logging – Janta Pharmacy

## Purpose

This document outlines the security principles, access controls,
and audit logging strategy for Janta Pharmacy.

The goal is to protect sensitive data, ensure controlled access,
and provide traceability for critical operations.

## Security Principles

- Secure by default
- Least-privilege access
- Explicit authorization checks
- Auditability for sensitive actions
- Defense in depth

## Authentication

- Token-based authentication (e.g., JWT)
- Short-lived access tokens
- Refresh token rotation (future)
- Secure storage of credentials

Passwords are:
- Hashed using a strong one-way algorithm
- Never stored or logged in plaintext

## Authorization

Role-Based Access Control (RBAC) is used.

### Roles
- Customer
- Pharmacy Admin
- Delivery Staff (future)

### Enforcement
- Authorization checks at API boundaries
- Role validation before sensitive operations
- No implicit access based on UI

## Sensitive Operations

The following actions require strict authorization
and must be auditable:

- Prescription approval or rejection
- Order status changes
- Inventory adjustments
- Payment status updates
- Admin role changes

## Audit Logging

Audit logs are recorded for all sensitive operations.

### What Is Logged
- Actor (user or system)
- Action performed
- Target entity (order, prescription, inventory item)
- Timestamp
- Outcome (success / failure)

### Properties

- Audit logs are append-only
- Logs are immutable
- Logs are never updated or deleted

## Audit Log Storage

- Stored in a dedicated audit log table
- Write-only access from application services
- Read access restricted to authorized admin roles

Logs may be exported to long-term storage for compliance or forensic analysis.

## Data Protection

- TLS enforced for all external communication
- Encryption at rest for databases and object storage
- Sensitive fields masked in application logs
- No PII or secrets in application logs

## Threats Addressed

- Unauthorized access
- Privilege escalation
- Data tampering
- Accidental data exposure
- Insider misuse

## Deferred Security Enhancements

- Multi-factor authentication
- Advanced fraud detection
- WAF and DDoS protection
- Zero-trust networking

These will be evaluated as the platform and team grow.
