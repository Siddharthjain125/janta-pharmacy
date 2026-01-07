# Janta Pharmacy — Backend

**NestJS API with domain-driven design**

---

## Overview

Production-grade backend built with **NestJS** and **TypeScript**, following a **modular monolith** architecture.

### Current Status

| Module | Status | Description |
|--------|--------|-------------|
| Auth | ✅ Complete | JWT + refresh tokens, phone-based identity |
| User | ✅ Complete | User profiles, roles |
| Catalog | ✅ Complete | Products, search, filtering, pagination |
| Order | ✅ Complete | Order lifecycle, state machine |
| Cart | ✅ Complete | Draft Order model |
| Prescription | 🚧 Scaffold | Future: upload, review |

---

## Quick Start

```bash
cd backend
npm install
npm run start:dev
```

**API Base URL:** http://localhost:3001/api/v1

---

## Architecture

### Module Structure

```
src/
├── auth/               # Authentication (JWT, guards, decorators)
├── user/               # User management
├── catalog/            # Product catalog (read-only)
├── order/              # Orders + Cart (Draft Order)
├── common/             # Shared utilities (logging, errors, API response)
└── database/           # Prisma service (deferred)
```

### Key Patterns

- **Domain-driven design** — Business rules in domain layer
- **Command-style APIs** — Intent-based endpoints (`/orders/:id/confirm`)
- **Repository abstraction** — In-memory now, database later
- **Thin controllers** — Logic in services, controllers just route

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with phone + password |
| POST | `/auth/login` | Login, receive JWT + refresh token |
| POST | `/auth/refresh` | Refresh access token |

### Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/catalog/products` | List products (paginated) |
| GET | `/catalog/products?search=...` | Search by name |
| GET | `/catalog/products?category=...` | Filter by category |
| GET | `/catalog/products/:id` | Get product details |
| GET | `/catalog/categories` | List categories |

### Cart (Draft Order)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get current cart |
| POST | `/cart` | Create or get cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:productId` | Update quantity |
| DELETE | `/cart/items/:productId` | Remove item |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List user's orders |
| GET | `/orders/:id` | Get order details |
| POST | `/orders` | Create order |
| POST | `/orders/:id/confirm` | Confirm order |
| POST | `/orders/:id/pay` | Record payment |
| POST | `/orders/:id/cancel` | Cancel order |

---

## Order Lifecycle

```
DRAFT → CREATED → CONFIRMED → PAID → SHIPPED → DELIVERED
  ↓        ↓          ↓         ↓        ↓
       [  Any of these can transition to CANCELLED  ]
```

- **DRAFT** — Cart state, items can be modified
- **CREATED** — Order placed, awaiting confirmation
- **CONFIRMED** — Validated, awaiting payment
- **PAID** — Payment received
- **DELIVERED** / **CANCELLED** — Terminal states

---

## Data Strategy

Currently using **in-memory repositories**. Database integration deferred until domain is stable.

```typescript
// All repositories implement interfaces
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  // ...
}

// Current: InMemoryOrderRepository
// Future: PrismaOrderRepository (same interface)
```

See [ADR-008](/docs/decisions.md#adr-008-deferred-database-integration) for rationale.

---

## Testing

```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

Tests use real in-memory repositories, not mocks.

---

## Configuration

```bash
# .env
PORT=3001
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run build` | Production build |
| `npm run start:prod` | Start production |
| `npm run lint` | ESLint |
| `npm test` | Run tests |

---

## Related Docs

- [Architecture](/docs/architecture.md)
- [Roadmap](/docs/roadmap.md)
- [Decisions](/docs/decisions.md)
