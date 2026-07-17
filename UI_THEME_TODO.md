# Premium UI theme migration

## Goal

Refresh the app’s visual color system with a premium dark theme while keeping all existing layout, component structure, and rendering behavior unchanged. Semantic token names must remain reusable for future themes.

## Theme contract

- [x] Define generic semantic CSS variables in `src/assets/styles/base.css`.
- [x] Add the semantic palette to `tailwind.config.js`.
- [x] Add a premium dark palette behind the existing `.dark` theme class.
- [x] Refine the light palette with clean cool neutrals and restrained indigo/violet accents.
- [x] Add light-mode compatibility mapping for legacy pastel utility classes.
- [x] Add light/dark theme switching to the floating edge menu.
- [x] Make dark mode the first-visit default while preserving an explicitly saved light-mode choice.
- [x] Polish the playlist popup in both themes: correct modal stacking, soften row surfaces, and stabilize long labels.
- [x] Polish song and playlist action popups: remove fixed pink card shadows and migrate action states to semantic theme colors.
- [ ] Remove remaining hard-coded page colors and legacy theme names from active UI styles. A dark-mode compatibility bridge currently covers the older loop/options/editor controls.

## Migration stages

- [x] Stage 1 — palette, token contract, Tailwind color aliases, scrollbar/card primitives.
- [x] Stage 2 — global chrome and shared components: navigation, menus, popups, buttons, loading, toast, player.
- [x] Stage 3 — home, login, utility, and secondary pages.
- [x] Stage 4 — primary lyrics pages, lyric catalog cards, playlist surfaces, and music interactions.
- [ ] Stage 4 follow-up — migrate remaining local lyric editor/loop/options controls off legacy pastel utility classes and remove the compatibility bridge.
- [x] Stage 5 — run type-check/build, inspect the diff, and verify light/dark behavior at desktop and mobile sizes.

## Guardrails

- Keep layout, spacing, component hierarchy, and behavior unchanged.
- Prefer semantic Tailwind classes such as `bg-background`, `bg-surface`, `bg-card`, `text-foreground`, `text-foreground-muted`, `border-border`, `text-primary`, and `bg-primary`.
- Keep theme-specific color values in CSS variables; future themes should only need a variable block.
- Preserve legacy aliases temporarily when they are needed to avoid breaking existing classes during migration.
