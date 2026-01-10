# Janta Pharmacy — Backend

**NestJS API with domain-driven design**

---

## Overview

Production-grade backend built with **NestJS** and **TypeScript**, following a **modular monolith** architecture.

### Current Status

| Module | Status | Description |
|--------|--------|-------------|
| Auth | ✅ Complete | JWT + refresh tokens, phone-based identity |
| User | ✅ Complete | User profiles, roles (persisted) |
| Catalog | ✅ Complete | Products, search, filtering, pagination |
| Order | ✅ Complete | Order lifecycle, state machine |
| Cart | ✅ Complete | Draft Order model |
| Database | ✅ Complete | PostgreSQL + Prisma ORM |
| Prescription | 🚧 Scaffold | Future: upload, review |

---

## Quick Start

### Option 1: With Database (Recommended)

```bash
cd backend

# Start PostgreSQL (requires Docker)
docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (admin, users, products)
npm run db:seed

# Start development server
npm run start:dev
```

### Option 2: Without Database (In-Memory)

```bash
cd backend
npm install
REPOSITORY_TYPE=memory npm run start:dev
```

**API Base URL:** http://localhost:3001/api/v1

---

## Database Setup

### PostgreSQL with Docker

The project includes a `docker-compose.yml` for local PostgreSQL:

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Environment Configuration

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Key environment variables:

```env
# Database connection (PostgreSQL)
DATABASE_URL="postgresql://janta:janta_dev_password@localhost:5432/janta_pharmacy?schema=public"

# Repository selection: 'prisma' (default with DATABASE_URL) or 'memory'
REPOSITORY_TYPE=prisma

# JWT secrets
JWT_SECRET=your-secret-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
```

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create and apply migrations |
| `npm run prisma:migrate:deploy` | Deploy migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed initial data |
| `npm run db:reset` | Reset database and re-run migrations |
| `npm run db:setup` | Run migrations + seed (full setup) |

### Seed Data

After running `npm run db:seed`, the following accounts are created:

| Role | Phone | Password |
|------|-------|----------|
| Admin | +919999900000 | admin123 |
| Pharmacist | +919999900001 | pharma123 |
| Staff | +919999900002 | staff123 |
| Customer | +919876543210 | customer123 |

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
└── database/           # Prisma service, repository providers
```

### Key Patterns

- **Domain-driven design** — Business rules in domain layer
- **Command-style APIs** — Intent-based endpoints (`/orders/:id/confirm`)
- **Repository abstraction** — Switchable between in-memory and Prisma
- **Thin controllers** — Logic in services, controllers just route

### Repository Strategy

The codebase supports both in-memory and Prisma repositories:

```typescript
// Environment-based selection
// In .env:
REPOSITORY_TYPE=prisma  // Use PostgreSQL
REPOSITORY_TYPE=memory  // Use in-memory (auto-detected if no DATABASE_URL)
```

Tests always use in-memory repositories for isolation.

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

## User Roles

| Role | Description |
|------|-------------|
| CUSTOMER | Regular users placing orders |
| STAFF | Pharmacy staff with limited access |
| PHARMACIST | Licensed pharmacist for prescription verification |
| ADMIN | Full system administrator |

Roles are persisted in the database and enforced via guards.

---

## Testing

```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

Tests automatically use in-memory repositories for isolation (no database required).

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run build` | Production build |
| `npm run start:prod` | Start production |
| `npm run lint` | ESLint |
| `npm test` | Run tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:setup` | Full database setup |

---

## Related Docs

- [Architecture](/docs/architecture.md)
- [Roadmap](/docs/roadmap.md)
- [Decisions](/docs/decisions.md)
