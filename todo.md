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
- [x] Default headers merge (global + request-level)
- [ ] Request lifecycle hooks:
  - [ ] `onRequest`
  - [ ] `onResponse`
  - [ ] `onError`
- [ ] Better playground examples
- [ ] Basic retry mechanism (network / 5xx only)

---

## v1.1 – Enhancements

> Goal: Better DX and safer defaults

- [ ] Automatic JSON handling:
  - [ ] JSON body serialization
- [ ] Better error messages for missing configuration
- [ ] Improved TypeScript inference for options

---

## v1.2 – Developer Experience

> Goal: Make Fetchiva pleasant to use and extend

- [ ] Debug / dev mode logging
- [ ] Reset configuration helper (for testing)

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
