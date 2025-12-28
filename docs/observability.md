# Observability – Janta Pharmacy

## Purpose

This document defines the observability strategy for Janta Pharmacy,
covering logging, metrics, and alerting.

The goal is to ensure that the system is:
- Understandable in production
- Debbugable under failure
- Operable by a small team

## Observability Principles

- Logs explain *what happened*
- Metrics show *how the system behaves*
- Alerts indicate *when action is required*
- Signal over noise
- Production issues must be diagnosable without guesswork

## Logging Strategy

The system uses structured, centralized logging.

### Logging Rules
- Logs are structured (key-value format)
- Each request has a correlation ID
- Logs include:
  - Timestamp
  - Request ID
  - User or system actor (when available)
  - Action being performed
  - Outcome (success / failure)

### What Is Never Logged
- Passwords
- Tokens or secrets
- Full payment details
- Sensitive PII

## Log Levels

- INFO: Business-relevant events (order created, payment initiated)
- WARN: Recoverable issues (retryable failures, degraded dependencies)
- ERROR: Failed operations requiring investigation
- DEBUG: Disabled in production by default

Logs are written to stdout and collected by the platform.

## Metrics Strategy

Metrics focus on system health and business-critical flows.

### System Metrics
- Request rate
- Error rate
- Latency (p95)
- CPU and memory usage

### System Metrics
- Request rate
- Error rate
- Latency (p95)
- CPU and memory usage

## Alerting Strategy

Alerts are configured only for conditions that require immediate human attention.

- High error rate on order placement
- Payment failure rate above threshold
- Database connectivity failures
- Service unavailable for sustained period

Alerts are actionable, not informational.

## Dashboards

Dashboards provide:
- System health overview
- Order and payment funnel visibility
- Error trends over time

Dashboards are used for diagnosis, not constant monitoring.

## Incident Response

- Logs are the primary debugging tool
- Metrics confirm system-wide impact
- Audit logs provide traceability for sensitive actions
- Post-incident learnings are documented

## What We Avoid

- Logging everything
- Excessive custom metrics
- Alerts for non-actionable events
- Overly complex observability stacks

