# Copilot Instructions

This file contains explicit rules and preferences for Copilot (and other automated agents) to follow when editing this repository.

Priority: Treat this file as authoritative for Copilot-specific behavior. If its rules conflict with other docs, follow this file unless a human maintainer instructs otherwise.

## Rules

- `script first`: Place `<script setup>` at the top of Vue SFCs (above `<template>`).
- `styling`: Prefer Tailwind utility classes for component styling when available; prefer adding Tailwind-friendly classes rather than large bespoke CSS blocks.
- `colors`: Prefer hexadecimal color notation (e.g. `#6f56ff`) over `rgb()`/`rgba()` for consistent palette usage.
- `formatting`: Use tabular numeric font-variant for time displays where appropriate (e.g. `font-variant-numeric: tabular-nums` or Tailwind's `tabular-nums`).
- `week-start`: Use Sunday as the first day of week in UI calendars unless a component explicitly documents otherwise.

## Notes

- When making repository-wide automated changes, create a short PR and list modified files so maintainers can review.
- Keep these rules concise; update this file when project conventions change.
