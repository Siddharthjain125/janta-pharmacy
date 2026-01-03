<div align="center">

# 🏥 Janta Pharmacy

**A modern, scalable pharmacy management platform**

[![CI](https://github.com/Siddharthjain125/janta-pharmacy/actions/workflows/ci.yml/badge.svg)](https://github.com/Siddharthjain125/janta-pharmacy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Architecture First](https://img.shields.io/badge/approach-architecture--first-purple.svg)](#architecture-first-approach)

</div>

> 🔄 **Project Reset (2025)**
> This repository has been re-purposed to document the design and
> development of a production-grade pharmacy platform.
> Earlier experiments have been archived in git history.

---

## 📖 Overview

Janta Pharmacy is a comprehensive pharmacy management platform designed to streamline operations for pharmacies of all sizes. This project follows an **architecture-first** development philosophy, ensuring scalability, maintainability, and clear documentation before any code is written.

> **Note**: This repository is in the **architecture and planning phase**. No application code exists yet by design.

---

## 🎯 Architecture-First Approach

We believe that **great software starts with great architecture**. Before writing a single line of application code, we:

1. **Define the system architecture** — Understanding components, boundaries, and data flow
2. **Document decisions** — Recording the "why" behind technical choices
3. **Plan infrastructure** — Designing for scalability and reliability from day one
4. **Establish security patterns** — Security is not an afterthought
5. **Set up CI/CD foundations** — Automation and quality gates from the start

This approach prevents technical debt accumulation and ensures all contributors understand the system's design principles.

---

## 🤖 AI-Assisted Development Philosophy

This project embraces **AI-assisted development** as a core methodology:

- **Documentation-Driven**: AI tools work best with clear context. Our comprehensive docs enable effective AI collaboration.
- **Iterative Refinement**: Architecture decisions are refined through AI-human dialogue.
- **Code Generation**: Once architecture is locked, AI assists in generating consistent, well-structured code.
- **Review & Quality**: AI-generated code undergoes the same rigorous review as human-written code.

> AI is a tool, not a replacement for engineering judgment. All decisions are validated by human architects.

---

## 📁 Project Structure

```
janta-pharmacy/
├── .github/workflows/        # CI/CD pipelines
├── docs/                     # Architecture & decision documentation
│   ├── architecture.md       # System architecture overview
│   ├── system-context.md     # System context and boundaries
│   ├── api-interactions.md   # API design and interactions
│   ├── data-ownership.md     # Data ownership and flow
│   ├── transactions.md       # Transaction patterns
│   ├── infrastructure.md     # Infrastructure design
│   ├── security.md           # Security patterns & policies
│   ├── observability.md      # Monitoring and observability
│   └── decisions.md          # ADRs and branching strategy
├── backend/                  # Backend services (planned)
├── frontend/                 # Web application (planned)
├── mobile/                   # Mobile application (planned)
└── infra/                    # Infrastructure as Code (planned)
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, components, and data flow |
| [System Context](docs/system-context.md) | System boundaries and external integrations |
| [API Interactions](docs/api-interactions.md) | API design patterns and interactions |
| [Data Ownership](docs/data-ownership.md) | Data ownership, flow, and governance |
| [Transactions](docs/transactions.md) | Transaction patterns and consistency |
| [Infrastructure](docs/infrastructure.md) | Cloud architecture and deployment strategy |
| [Security](docs/security.md) | Security model and compliance considerations |
| [Observability](docs/observability.md) | Monitoring, logging, and tracing |
| [Decisions](docs/decisions.md) | Architectural Decision Records (ADRs) |

---

## 🔀 Branching Strategy

We follow a simplified **GitFlow** model:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code (protected) |
| `develop` | Integration branch for features |
| `feature/*` | Individual feature development |
| `hotfix/*` | Emergency production fixes |

See [decisions.md](docs/decisions.md) for complete branching and protection rules.

---

## 🚀 Getting Started

### Prerequisites

- Git 2.30+
- (Additional prerequisites will be documented per component)

### Clone the Repository

```bash
git clone https://github.com/Siddharthjain125/janta-pharmacy.git
cd janta-pharmacy
```

### Development Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit following [conventional commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add user authentication module"
   ```

3. Push and create a Pull Request to `develop`:
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🗺️ Roadmap

### Phase 1: Foundation
- [x] Repository structure
- [x] Documentation framework
- [x] CI/CD pipeline foundation
- [x] Complete architecture documentation
- [x] Technology stack decisions

### Phase 2: Core Development (Current)
- [x] Backend API scaffold
- [x] Frontend application scaffold
- [ ] Database schema design
- [ ] Authentication system

### Phase 3: Features
- [ ] Inventory management
- [x] Order processing
- [ ] Customer management
- [ ] Reporting & analytics

### Phase 4: Mobile & Scale
- [ ] Mobile application
- [ ] Performance optimization
- [ ] Advanced features

---

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines (coming soon) before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

For questions or suggestions, please open an issue or reach out to the maintainers.

---

<div align="center">

**Built with ❤️ using an Architecture-First approach**

</div>
