# Infrastructure

> **Status:** Intentionally Deferred

---

## Why Deferred?

Infrastructure is **explicitly deferred** until:
1. Domain model is stable
2. Deployment target is identified
3. Real scaling requirements exist

See [ADR-008](/docs/decisions.md#adr-008-deferred-database-integration) for rationale.

---

## Future Scope

When implemented, this directory will contain:

```
infra/
├── terraform/          # Cloud resources
├── docker/             # Container definitions
└── scripts/            # Deployment automation
```

---

## Current Development

For local development, run services directly:

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

No Docker, Kubernetes, or cloud infrastructure required.
