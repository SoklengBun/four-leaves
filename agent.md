# Agent Rules and Notes

## Vue SFCs

- Prefer placing the `<script setup>` block at the top of single-file components (above `<template>`).
  - Rationale: keeps component logic centralized and avoids issues with some tooling or editor expectations.

## Auth quickLogin behavior

- If `quickLogin` fails (non-zero API response or network error), clear the stored `auth_token` in local storage to avoid repeated automatic attempts triggered by the router's `beforeEach` guard.
  - This prevents infinite retry loops when the API is unavailable (e.g., `net::ERR_CONNECTION_REFUSED`).

## Notes

- Keep these rules short; update as needed when project patterns change.
