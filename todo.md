# Fetchiva – TODO

This document tracks the planned features and milestones for Fetchiva.
It serves as a lightweight roadmap and internal development checklist.

---

## v1 – Core (MVP)

> Goal: Stable, framework-agnostic, browser-first fetch client

- [x] Global configuration support (`baseURL`, `headers`)
- [x] Explicit initialization via `configureFetchiva`
- [x] Framework-agnostic setup (HTML, React, Vue, etc.)
- [x] Core `fetchiva(path, options)` wrapper
- [ ] HTTP method helpers:
  - [ ] `get`
  - [ ] `post`
  - [ ] `put`
  - [ ] `patch`
  - [ ] `delete`
- [x] Request-level override for:
  - [x] `baseURL`
  - [x] `headers`
- [x] Timeout support using `AbortController`
- [ ] Unified error handling (network, timeout, HTTP errors)
- [x] TypeScript types for public API
- [ ] JSDoc documentation for all public methods
- [x] Playground for local development (not published to npm)
- [x] Clean npm publish setup (`dist` only)

---

## v1.1 – Enhancements

> Goal: Better DX and safer defaults

- [x] Default headers merge (global + request-level)
- [ ] Automatic JSON handling:
  - [ ] JSON body serialization
  - [x] JSON response parsing
- [ ] Basic retry mechanism (network / 5xx only)
- [ ] Better error messages for missing configuration
- [ ] Improved TypeScript inference for options

---

## v1.2 – Developer Experience

> Goal: Make Fetchiva pleasant to use and extend

- [ ] Request lifecycle hooks:
  - [ ] `onRequest`
  - [ ] `onResponse`
  - [ ] `onError`
- [ ] Debug / dev mode logging
- [ ] Reset configuration helper (for testing)
- [ ] Better playground examples

---

## v2 – Future Ideas (Non-goals for v1)

> These are intentionally postponed to keep v1 simple

- [ ] Interceptor system (axios-style)
- [ ] Request caching layer
- [ ] Request deduplication
- [ ] Plugin system
- [ ] Rate-limit / queue support
- [ ] Node-specific helpers (optional)

---

## Design Principles

- Browser-first
- Framework-agnostic
- Explicit configuration (no magic auto-loading)
- Minimal API surface
- Predictable behavior
- Easy to debug

---

## Notes

- Configuration must be initialized once at app startup.
- Playground is for development only and should not be published to npm.
- Global mutable state is allowed but must be explicit and documented.
