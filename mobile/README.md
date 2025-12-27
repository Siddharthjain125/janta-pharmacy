# Mobile

> **Status**: 🚧 Not Yet Implemented
> **Component**: Mobile Application

---

## Overview

This directory will contain the mobile application for Janta Pharmacy, primarily designed for staff operations and potentially customer use.

## Planned Structure

```
mobile/
├── src/
│   ├── components/    # Reusable UI components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation configuration
│   ├── services/      # API client and services
│   ├── store/         # State management
│   └── utils/         # Utility functions
├── assets/
├── __tests__/
├── android/           # Android-specific code
├── ios/               # iOS-specific code
└── package.json
```

## Technology Stack

> **Decision Pending** - See [/docs/decisions.md](/docs/decisions.md)

### Candidates Under Consideration

| Option | Language | Approach | Pros | Cons |
|--------|----------|----------|------|------|
| React Native | JavaScript/TypeScript | Cross-platform | Code sharing with web, large ecosystem | Bridge overhead |
| Flutter | Dart | Cross-platform | Performance, consistent UI | New language |
| Native (Swift/Kotlin) | Swift/Kotlin | Platform-specific | Best performance, platform features | Dual codebases |

## Primary Use Cases

### Staff Operations (MVP)
- [ ] Inventory scanning (barcode)
- [ ] Stock updates
- [ ] Order notifications
- [ ] Quick product lookup

### Customer Features (Phase 2)
- [ ] Order placement
- [ ] Prescription uploads
- [ ] Store locator
- [ ] Push notifications

## Getting Started

Instructions will be added once the technology stack is selected.

```bash
# Placeholder - commands will vary based on stack
cd mobile

# React Native
npm install
npx react-native run-ios  # or run-android

# Flutter
flutter pub get
flutter run
```

## Platform Support

| Platform | Minimum Version | Target |
|----------|-----------------|--------|
| iOS | 13.0 | Latest |
| Android | API 24 (7.0) | Latest |

## Next Steps

1. [ ] Select mobile framework
2. [ ] Initialize project structure
3. [ ] Set up development environment
4. [ ] Implement authentication flow
5. [ ] Build core staff features

---

## Contributing

Please read the main [README.md](/README.md) for contribution guidelines.

