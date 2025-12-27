# Data Ownership – Janta Pharmacy

## Purpose

This document defines which backend modules own which data
and establishes clear boundaries for data access.

The goal is to avoid tight coupling, unclear responsibilities,
and uncontrolled cross-module dependencies.

## Ownership Rule

Each module:
- Owns its data models and tables
- Is the only module allowed to write to its data
- Exposes data to other modules only through well-defined interfaces

Direct database access across module boundaries is not allowed.

## User Management

### Owned Data
- Users
- Roles
- Authentication credentials
- Addresses

### Responsibilities
- User identity and lifecycle
- Authentication and authorization
- Role-based access control

### Access Rules
- Other modules may reference user IDs
- No other module may modify user data

## Catalog & Inventory

### Owned Data
- Medicines
- Categories
- Stock levels
- Pricing

### Responsibilities
- Medicine availability
- Stock updates
- Pricing rules

### Access Rules
- Read access allowed for order placement
- Stock updates only through this module

## Prescriptions

### Owned Data
- Prescription records
- Uploaded prescription documents
- Validation status

### Responsibilities
- Prescription submission
- Prescription review and approval
- Linking prescriptions to orders

### Access Rules
- Orders may reference approved prescriptions
- Prescription state changes only within this module

## Orders

### Owned Data
- Orders
- Order items
- Order status history

### Responsibilities
- Order creation
- Order state transitions
- Coordination with payments and inventory

### Access Rules
- Other modules may query order status
- Order mutations are exclusive to this module

## Payments

### Owned Data
- Payment transactions
- Payment status
- Gateway references

### Responsibilities
- Payment initiation
- Payment status tracking
- Handling success and failure scenarios

### Access Rules
- Orders reference payment status
- No other module modifies payment data

## Notifications

### Owned Data
- Notification logs
- Delivery status (SMS / Email)

### Responsibilities
- Sending notifications
- Tracking delivery outcomes

### Access Rules
- Other modules publish notification requests
- Notification internals remain isolated

## Cross-Module Interaction Pattern

- Modules communicate via service interfaces
- Data is exchanged using IDs and DTOs
- No shared database tables
- No cross-module foreign key constraints

This keeps modules loosely coupled
while remaining within a single deployable unit.

## Future Evolution

If the system grows in scale or team size:
- Modules can be extracted into independent services
- Data ownership boundaries already align with service boundaries
- Minimal refactoring would be required

This is an intentional design choice.