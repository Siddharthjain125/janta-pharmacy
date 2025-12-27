# Infrastructure Assumptions – Janta Pharmacy

## Purpose

This document outlines the initial infrastructure assumptions for Janta Pharmacy, focusing on simplicity, cost efficiency, and operational clarity.

The goal is to support early-stage production usage
while remaining flexible for future growth.

## Guiding Principles

- Prefer managed services over self-hosted solutions
- Optimize for operational simplicity
- Keep infrastructure costs predictable
- Scale only when usage justifies it
- Avoid premature complexity

## Deployment Model

The system will be deployed as a single backend application
(modular monolith) behind a load balancer.

Frontend and backend are deployed independently.

This model:
- Reduces operational overhead
- Simplifies debugging
- Supports horizontal scaling when needed

## Compute

Service: AWS ECS (Fargate)

Rationale:
- No server management
- Simple scaling
- Good fit for containerized applications
- Lower operational burden than Kubernetes initially

## Database

Service: Amazon RDS (PostgreSQL)

Rationale:
- Strong relational guarantees
- ACID compliance
- Managed backups and upgrades
- Suitable for transactional workloads

## Caching

Service: Amazon ElastiCache (Redis) – optional

Use cases:
- Session caching
- Frequently accessed catalog data

Introduced only if performance requires it.

## Object Storage

Service: Amazon S3

Use cases:
- Prescription uploads
- Invoices and reports
- Static assets

## Networking & Security

- Application Load Balancer (ALB)
- Private subnets for backend and database
- Public subnets for load balancer
- IAM roles with least-privilege access
- Security groups restricting access by role

## Estimated Monthly Cost (Early Stage)

The following estimates assume:
- Low to moderate traffic
- Single-region deployment
- No heavy analytics or background processing

Approximate costs (USD/month):

- ECS (Fargate): $30 – $60
- RDS (Postgres): $40 – $80
- S3: $5 – $10
- Load Balancer + networking: $20 – $40

Estimated total: $100 – $190 / month

These are directional estimates, not exact numbers.
Actual costs depend on traffic, usage patterns,
and operational decisions.

## Scaling Strategy

As usage grows:
- Scale ECS tasks horizontally
- Introduce Redis for caching
- Add read replicas to the database
- Introduce async processing where needed

No infrastructure changes are made until metrics justify them.

## What We Explicitly Avoid Initially

- Kubernetes (EKS)
- Multi-region deployment
- Service mesh
- Over-provisioned resources

These can be introduced later if scale and team maturity demand it.
