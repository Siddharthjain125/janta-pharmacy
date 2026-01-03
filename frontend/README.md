# Janta Pharmacy - Frontend

> **Status**: 🏗️ Scaffolding Phase
> **Framework**: Next.js 14 (App Router)

---

## Overview

This is the frontend application for Janta Pharmacy, built with **Next.js** and **TypeScript**. Following the project's **architecture-first** philosophy, this is currently a structural scaffold designed to be extended with real features.

### What This Is

- ✅ Clean Next.js App Router project structure
- ✅ TypeScript configuration
- ✅ API client abstraction (fetch-based)
- ✅ Authentication context (mocked)
- ✅ Protected route component
- ✅ Basic routing setup
- ✅ Type definitions aligned with backend

### What This Is NOT (Yet)

- ❌ Complete UI/UX implementation
- ❌ Real authentication flow
- ❌ Form validation
- ❌ State management library
- ❌ Styling framework (Tailwind, etc.)
- ❌ Testing setup

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Login page
│   │   └── orders/             # Orders pages
│   │       ├── page.tsx        # Orders list
│   │       └── [id]/           # Order detail
│   │
│   ├── lib/                    # Core utilities
│   │   ├── api-client.ts       # HTTP client
│   │   ├── auth-context.tsx    # Auth provider
│   │   └── constants.ts        # App constants
│   │
│   ├── components/             # Shared components
│   │   ├── Header.tsx          # Navigation header
│   │   └── ProtectedRoute.tsx  # Auth guard
│   │
│   └── types/                  # TypeScript types
│       └── api.ts              # API types (aligned with backend)
│
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Why Scaffolding First?

1. **Alignment with Backend**: Types and API contracts match the backend exactly
2. **Clear Architecture**: Structure is established before features
3. **Team Onboarding**: New developers understand the patterns
4. **Progressive Enhancement**: Features added incrementally

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port shown in terminal).

### Build

```bash
npm run build
npm run start
```

---

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/login` | Login page | No |
| `/orders` | Orders list | Yes |
| `/orders/[id]` | Order detail | Yes |

---

## API Integration

The frontend is designed to connect to the backend API:

```typescript
import { apiClient } from '@/lib/api-client';

// Example (not yet implemented)
const orders = await apiClient.get<Order[]>('/orders');
```

### Backend URL

Set in environment or defaults to `http://localhost:3000/api/v1`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Authentication

Currently using **mock authentication** for development:

- Any email/password combination works
- User is always authenticated with mock data
- Token is a placeholder string

### Real Auth TODO

1. Connect to `/auth/login` endpoint
2. Store tokens securely
3. Implement token refresh
4. Add logout flow

---

## Type Safety

Types in `src/types/api.ts` are aligned with backend DTOs:

- `Order` ↔ `OrderDto`
- `OrderStatus` ↔ `OrderStatus` enum
- `ApiResponse<T>` ↔ `ApiResponse<T>`

---

## Next Steps

1. [ ] Add Tailwind CSS for styling
2. [ ] Implement real API calls
3. [ ] Add form validation (zod/yup)
4. [ ] Connect to real authentication
5. [ ] Add error boundaries
6. [ ] Add loading states
7. [ ] Add testing (Jest, React Testing Library)

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript check |

---

## Contributing

Please refer to the main [README.md](/README.md) for contribution guidelines.

---

## License

MIT - See [LICENSE](/LICENSE)
