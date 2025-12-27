# Transaction & Consistency Boundaries – Janta Pharmacy

## Purpose

This document defines how transactions are scoped within the system,
which operations require strong consistency, and how cross-module
workflows are coordinated.

The goal is to ensure correctness while keeping the system simple
and maintainable.

## Core Transaction Principle

- Transactions are scoped within a single module
- Each module is responsible for maintaining its own consistency
- Cross-module workflows are coordinated at the application layer
- Distributed transactions are explicitly avoided

## User Registration

### Transaction Scope
- Create user record
- Assign default role

### Consistency Requirement
Strong consistency

### Rationale
A user must not exist in a partially initialized state.

## Order Placement

### Transaction Scope
- Create order
- Create order items
- Set initial order status

### Consistency Requirement
Strong consistency

### Rationale
An order must be created atomically to avoid orphaned items
or invalid states.

## Prescription Approval

### Transaction Scope
- Update prescription status
- Record approval metadata

### Consistency Requirement
Strong consistency

### Rationale
Prescription state must always be authoritative and auditable.

## Order and Inventory Coordination

### Flow
1. Order is created (transactional)
2. Inventory reservation is requested
3. Inventory module validates availability
4. Inventory is updated or order is rejected

### Consistency Model
Eventual consistency between modules

### Failure Handling
- If inventory update fails, order is cancelled
- Order state reflects failure reason

## Payment Processing

### Flow
1. Order is created
2. Payment is initiated
3. Payment gateway responds asynchronously
4. Payment status is updated

### Consistency Model
Eventual consistency

### Failure Handling
- Payment failure does not rollback order creation
- Order transitions to a failed or retryable state

## State Transition Rules

- State transitions are explicit and validated
- Invalid transitions are rejected
- State changes are recorded with timestamps
- Order and prescription states are append-only for auditability

## What We Explicitly Avoid

- Cross-module database transactions
- Two-phase commit
- Shared transactional boundaries across modules

These approaches increase complexity
without sufficient early-stage benefit.