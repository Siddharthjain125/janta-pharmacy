# Janta Pharmacy - Backend

> **Status**: 🏗️ Skeleton Implementation
> **Architecture**: Modular Monolith

---

## Overview

This is the backend service for Janta Pharmacy, built with **NestJS** and **TypeScript**. The architecture follows a **modular monolith** pattern, designed for clarity, maintainability, and future scalability.

### What This Is

- ✅ Clean, production-grade project structure
- ✅ Modular architecture with clear boundaries
- ✅ Common utilities (logging, error handling, correlation IDs)
- ✅ Configuration management foundation
- ✅ Authentication scaffolding (JWT guards, role decorators)
- ✅ Order module with domain-driven state machine
- ✅ In-memory repository for development

### What This Is NOT (Yet)

- ❌ Complete business logic for all modules
- ❌ Production database connectivity
- ❌ Real JWT token validation
- ❌ External service integrations (payment, notifications)

---

## Architecture

### Modular Monolith Approach

The backend is organized into **self-contained modules**, each responsible for a specific domain:

```
src/
├── user/           # User management domain
├── catalog/        # Product catalog domain
├── order/          # Order management domain
├── prescription/   # Prescription handling domain
├── payment/        # Payment processing (cross-cutting)
├── notification/   # Notification delivery (cross-cutting)
└── audit/          # Audit logging (cross-cutting)
```

### Key Principles

1. **Module Independence**: Each module owns its data and logic
2. **No Cross-Module Data Access**: Modules communicate via services, not direct data access
3. **Clean Interfaces**: Well-defined APIs between modules
4. **Future-Ready**: Easy to extract into microservices if needed

### Directory Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   │
│   ├── config/                 # Configuration
│   │   ├── app.config.ts       # Application settings
│   │   └── security.config.ts  # Security settings
│   │
│   ├── common/                 # Shared utilities
│   │   ├── api/                # API response/error structures
│   │   ├── exceptions/         # Base exceptions
│   │   ├── filters/            # Exception filters
│   │   ├── interceptors/       # Request interceptors
│   │   └── logging/            # Logger implementation
│   │
│   ├── auth/                   # Authentication module
│   │   ├── guards/             # JWT and roles guards
│   │   ├── decorators/         # @CurrentUser, @Roles, @Public
│   │   └── interfaces/         # AuthUser interface
│   │
│   ├── database/               # Database module
│   │   └── prisma.service.ts   # Prisma client wrapper
│   │
│   ├── order/                  # Order module (domain-driven)
│   │   ├── domain/             # State machine, status enum
│   │   ├── dto/                # Data transfer objects
│   │   ├── exceptions/         # Domain exceptions
│   │   └── repositories/       # Data access layer
│   │
│   ├── user/                   # User module
│   ├── catalog/                # Catalog module
│   ├── prescription/           # Prescription module
│   ├── payment/                # Payment service
│   ├── notification/           # Notification service
│   └── audit/                  # Audit service
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── test/                       # Test files
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Alignment with Architecture Docs

This implementation aligns with the project's architecture documentation:

| Document | Alignment |
|----------|-----------|
| [architecture.md](/docs/architecture.md) | Modular structure, separation of concerns |
| [api-interactions.md](/docs/api-interactions.md) | REST API design, standard responses |
| [security.md](/docs/security.md) | Security config placeholders, CORS setup |
| [observability.md](/docs/observability.md) | Logging, correlation IDs |

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### API Base URL

```
http://localhost:3000/api/v1
```

---

## API Endpoints

All endpoints return placeholder responses.

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/catalog/products` | List products |
| GET | `/api/v1/catalog/products/:id` | Get product |
| GET | `/api/v1/catalog/categories` | List categories |
| GET | `/api/v1/catalog/search` | Search products |

### Orders

The Order module implements a **domain-driven state machine** for lifecycle management.

#### Order Lifecycle
```
CREATED → CONFIRMED → PAID → SHIPPED → DELIVERED
    ↓          ↓        ↓        ↓
 CANCELLED  CANCELLED  CANCELLED  CANCELLED
```

#### Query Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List user's orders |
| GET | `/api/v1/orders?status=CONFIRMED` | Filter by status |
| GET | `/api/v1/orders/:id` | Get order details |

#### Command Endpoints (Intent-Based)
| Method | Endpoint | Transition | Description |
|--------|----------|------------|-------------|
| POST | `/api/v1/orders` | → CREATED | Create new order |
| POST | `/api/v1/orders/:id/confirm` | CREATED → CONFIRMED | Confirm order |
| POST | `/api/v1/orders/:id/pay` | CONFIRMED → PAID | Record payment |
| POST | `/api/v1/orders/:id/cancel` | * → CANCELLED | Cancel order |

#### Order Status Codes
| Status | Description |
|--------|-------------|
| `CREATED` | Order placed, awaiting confirmation |
| `CONFIRMED` | Order confirmed, awaiting payment |
| `PAID` | Payment received |
| `SHIPPED` | Order in transit |
| `DELIVERED` | Order delivered (terminal) |
| `CANCELLED` | Order cancelled (terminal) |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/prescriptions` | List prescriptions |
| GET | `/api/v1/prescriptions/:id` | Get prescription |
| POST | `/api/v1/prescriptions` | Upload prescription |
| PUT | `/api/v1/prescriptions/:id/verify` | Verify prescription |

---

## Configuration

Configuration is managed via environment variables:

```bash
# .env.example
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Security (placeholders)
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

## Next Steps

The following will be implemented in subsequent phases:

1. **Database Integration**
   - PostgreSQL setup
   - TypeORM/Prisma integration
   - Entity definitions

2. **Authentication**
   - JWT implementation
   - Role-based access control
   - Session management

3. **Business Logic**
   - Validation rules
   - Domain logic
   - Error handling

4. **External Integrations**
   - Payment gateway
   - Email/SMS services
   - File storage

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start application |
| `npm run start:dev` | Start with hot reload |
| `npm run start:debug` | Start with debugger |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## Contributing

Please refer to the main [README.md](/README.md) for contribution guidelines.

---

## License

MIT - See [LICENSE](/LICENSE)
