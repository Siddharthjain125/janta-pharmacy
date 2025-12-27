# Frontend

> **Status**: 🚧 Not Yet Implemented
> **Component**: Web Application

---

## Overview

This directory will contain the customer-facing web application and admin dashboard for Janta Pharmacy.

## Planned Structure

```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components / routes
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API client and services
│   ├── store/         # State management
│   ├── styles/        # Global styles and themes
│   └── utils/         # Utility functions
├── public/
├── tests/
├── package.json
└── README.md
```

## Technology Stack

> **Decision Pending** - See [/docs/decisions.md](/docs/decisions.md)

### Candidates Under Consideration

| Option | Framework | Rendering | Pros | Cons |
|--------|-----------|-----------|------|------|
| Next.js | React | SSR/SSG/ISR | Full-featured, Vercel support | Opinionated |
| Remix | React | SSR | Modern patterns, nested routing | Newer ecosystem |
| Vite + React | React | SPA | Fast, flexible | Manual SSR setup |

### UI Library Options

- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Accessible component primitives
- **Radix UI** - Headless components
- **Material UI** - Complete component library

## Getting Started

Instructions will be added once the technology stack is selected.

```bash
# Placeholder - commands will vary based on stack
cd frontend
npm install
npm run dev
```

## Design System

A design system will be established including:

- Color palette
- Typography scale
- Spacing system
- Component library
- Accessibility guidelines

## Features (Planned)

### Customer-Facing
- [ ] Product browsing and search
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order history
- [ ] User profile

### Admin Dashboard
- [ ] Inventory management
- [ ] Order processing
- [ ] Customer management
- [ ] Analytics and reports

## Next Steps

1. [ ] Select framework and UI library
2. [ ] Initialize project structure
3. [ ] Set up design system
4. [ ] Implement core layout and navigation
5. [ ] Connect to backend API

---

## Contributing

Please read the main [README.md](/README.md) for contribution guidelines.

