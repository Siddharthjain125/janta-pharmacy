# Janta Pharmacy

**Architecture-first pharmacy platform — a production-grade portfolio project**

[![CI](https://github.com/Siddharthjain125/janta-pharmacy/actions/workflows/ci.yml/badge.svg)](https://github.com/Siddharthjain125/janta-pharmacy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What This Is

Janta Pharmacy is a **public, production-grade** pharmacy management platform built to demonstrate:

- **Architecture-first development** — Design decisions precede implementation
- **Domain-driven design** — Real business complexity, not toy CRUD
- **Modular monolith** — Clean boundaries, future-proof structure
- **Progressive delivery** — Each phase produces working software

This is a portfolio project optimized for senior engineering review.

---

## Current Status

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 0 | Architecture Blueprint | ✅ Complete |
| Phase 0.5 | Core Domain Validation | ✅ Complete |
| Phase 1 | Authentication | ✅ Complete |
| Phase 2 | Catalog Browsing | ✅ Complete |
| Phase 3A | Cart (Draft Order) | ✅ Complete |
| Phase 3B | Checkout & History | 🔜 Next |

**What works today:**
- User registration and login (phone-based, JWT + refresh tokens)
- Product catalog with search, filtering, pagination
- Shopping cart backed by Draft Order domain model
- Protected routes, session persistence

See [docs/roadmap.md](docs/roadmap.md) for detailed progress.

---

## Architecture

**Style:** Modular Monolith

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│                   (Next.js / React)                     │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────┐
│                       Backend                           │
│                      (NestJS)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │  Catalog │  │  Orders  │  │  ...   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                    Modules with clear boundaries        │
└─────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- **Cart = Draft Order** — No separate cart entity; cart is an Order in DRAFT state
- **In-memory repositories** — Database deferred until domain is stable
- **Domain-first** — Business rules enforced in domain layer, not controllers

See [docs/architecture.md](docs/architecture.md) for details.

---

## Quick Start

```bash
# Clone
git clone https://github.com/Siddharthjain125/janta-pharmacy.git
cd janta-pharmacy

# Backend (port 3001)
cd backend
npm install
npm run start:dev

# Frontend (port 3000)
cd frontend
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1

---

## Project Structure

```
janta-pharmacy/
├── backend/          # NestJS API (auth, catalog, orders)
├── frontend/         # Next.js web app
├── docs/             # Architecture & decision documentation
├── infra/            # Infrastructure (intentionally deferred)
└── mobile/           # Mobile app (intentionally deferred)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Roadmap](docs/roadmap.md) | Phase definitions and progress |
| [Architecture](docs/architecture.md) | System design and rationale |
| [Decisions](docs/decisions.md) | Architectural Decision Records |

---

## Philosophy

1. **Architecture before features** — Get the design right first
2. **Validate hard problems early** — Orders before catalog
3. **Infrastructure when justified** — No premature optimization
4. **Truthful documentation** — Docs reflect reality, not aspirations

---

## License

MIT — See [LICENSE](LICENSE)
