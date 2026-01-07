# Janta Pharmacy — Frontend

**Next.js web application with real authentication and API integration**

---

## Overview

Production-grade frontend built with **Next.js 14** (App Router) and **TypeScript**.

### Current Status

| Feature | Status |
|---------|--------|
| Authentication | ✅ JWT + refresh tokens |
| Session persistence | ✅ Survives page reload |
| Protected routes | ✅ Redirect to login |
| Catalog browsing | ✅ Search, filter, paginate |
| Product details | ✅ Full product view |
| Shopping cart | ✅ Add, update, remove items |

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

**URL:** http://localhost:3000

**Requires backend running on:** http://localhost:3001

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── catalog/            # Product listing + detail
│   ├── cart/               # Shopping cart
│   └── orders/             # Order history (planned)
│
├── components/             # Shared components
│   ├── Header.tsx          # Navigation with auth state
│   └── ProtectedRoute.tsx  # Auth guard wrapper
│
├── lib/                    # Core utilities
│   ├── api-client.ts       # HTTP client with token refresh
│   ├── auth-context.tsx    # React context for auth
│   ├── auth-service.ts     # Auth API calls
│   ├── catalog-service.ts  # Catalog API calls
│   ├── cart-service.ts     # Cart API calls
│   └── constants.ts        # Routes, config
│
└── types/                  # TypeScript definitions
    └── api.ts              # API types (aligned with backend)
```

---

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home | No |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/catalog` | Product listing | Yes |
| `/catalog/[id]` | Product detail | Yes |
| `/cart` | Shopping cart | Yes |
| `/orders` | Order history (planned) | Yes |

---

## Authentication Flow

1. **Login** — POST to `/auth/login`, receive JWT + refresh token
2. **Token storage** — Access token in memory, refresh token in localStorage
3. **API calls** — Access token in Authorization header
4. **401 handling** — Automatic token refresh, retry request
5. **Session restore** — On page load, refresh token if available

```typescript
// Auth context provides:
const { isAuthenticated, user, login, logout, isLoading } = useAuth();
```

---

## API Integration

All API calls go through centralized client with automatic auth:

```typescript
import { apiClient } from '@/lib/api-client';

// Auth handled automatically
const response = await apiClient.get<Product[]>('/catalog/products');
```

Service modules for each domain:
- `auth-service.ts` — login, register, refresh
- `catalog-service.ts` — products, categories
- `cart-service.ts` — cart operations

---

## Cart Integration

Cart is backed by Draft Order on backend:

```typescript
import { addItemToCart, getCart, updateCartItem, removeCartItem } from '@/lib/cart-service';

// Add to cart (creates draft if needed)
await addItemToCart(productId, quantity);

// Get current cart
const cart = await getCart();

// Update quantity
await updateCartItem(productId, newQuantity);

// Remove item
await removeCartItem(productId);
```

---

## Environment

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run lint` | ESLint |

---

## Styling

Currently using **inline styles** (minimal). No styling framework yet.

Future options: Tailwind CSS, CSS Modules, or styled-components.

---

## Related Docs

- [Architecture](/docs/architecture.md)
- [Roadmap](/docs/roadmap.md)
- [Backend README](/backend/README.md)
