# Agent Rules and Notes

## Vue SFCs

- Prefer placing the `<script setup>` block at the top of single-file components (above `<template>`).
  - Rationale: keeps component logic centralized and avoids issues with some tooling or editor expectations.

## Project Rules (explicit)

- `script first`: Place `<script setup>` at the top of Vue SFCs (above `<template>`).
- `styling`: Prefer Tailwind utility classes for component styling when available; prefer adding Tailwind-friendly classes rather than large bespoke CSS blocks.
- `colors`: Prefer hexadecimal color notation (e.g. `#6f56ff`) over `rgb()`/`rgba()` for consistent palette usage.
- `formatting`: Use tabular numeric font-variant for time displays where appropriate (e.g. `tabular-nums`).

These rules are authoritative for the agent and local contributors; update this file when project conventions change.

## Auth quickLogin behavior

- If `quickLogin` fails (non-zero API response or network error), clear the stored `auth_token` in local storage to avoid repeated automatic attempts triggered by the router's `beforeEach` guard.
  - This prevents infinite retry loops when the API is unavailable (e.g., `net::ERR_CONNECTION_REFUSED`).

## Notes

- Keep these rules short; update as needed when project patterns change.
