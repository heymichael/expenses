---
name: brand-guidelines
description: Apply Haderach brand colors, typography, and token conventions when generating or modifying UI code. Use when creating components, styling elements, choosing colors, or working with the design system.
---

# Haderach Brand Guidelines

## Token Architecture

Haderach uses a two-tier Tailwind v4 token system. All tokens are defined in CSS `@theme` blocks — no JS config files.

### Tier 1: Platform chrome (shared-ui)

Defined in `@haderach/shared-ui/theme` (from `haderach-home` repo). These style the global UI shell (nav, tooltips, dropdowns) and are **identical across all apps**. Never redefine these in app-level `@theme` blocks.

| Token | Tailwind class | Purpose |
|-------|---------------|---------|
| `--color-chrome-bg` | `bg-chrome-bg` | Nav/popover background |
| `--color-chrome-border` | `border-chrome-border` | Nav and dropdown borders |
| `--color-chrome-text` | `text-chrome-text` | Default nav text |
| `--color-chrome-text-strong` | `text-chrome-text-strong` | Tooltip text, button labels |
| `--color-chrome-text-hover` | `text-chrome-text-hover` | Hover/active text |
| `--color-chrome-text-muted` | `text-chrome-text-muted` | Secondary nav text |
| `--color-chrome-subtle` | `bg-chrome-subtle` | Subtle hover backgrounds |
| `--color-chrome-hover` | `bg-chrome-hover` | Hover/tooltip backgrounds |
| `--color-chrome-avatar` | `bg-chrome-avatar` | Avatar fallback circle |

### Tier 2: App tokens (this app)

Defined in `src/index.css` `@theme` block. Expenses uses an oklch-based sidebar palette.

| Token | Tailwind class | Purpose |
|-------|---------------|---------|
| `--color-sidebar` | `bg-sidebar` | Sidebar background |
| `--color-sidebar-foreground` | `text-sidebar-foreground` | Sidebar text |
| `--color-sidebar-primary` | `bg-sidebar-primary` | Sidebar primary accent |
| `--color-sidebar-primary-foreground` | `text-sidebar-primary-foreground` | Text on sidebar primary |
| `--color-sidebar-accent` | `bg-sidebar-accent` | Sidebar hover/active backgrounds |
| `--color-sidebar-accent-foreground` | `text-sidebar-accent-foreground` | Text on sidebar accent |
| `--color-sidebar-border` | `border-sidebar-border` | Sidebar borders |
| `--color-sidebar-ring` | `ring-sidebar-ring` | Sidebar focus rings |

## Typography

All apps use **Geist Sans** as the sole typeface. Font files are loaded by `@haderach/shared-ui/theme`.

```
--font-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, Helvetica, Arial, sans-serif;
```

Weights available: 400 (regular), 500 (medium), 600 (semibold).

## Color System

- All tokens use **oklch** color space for perceptual uniformity.

## Rules

1. **Always use Tailwind token classes** (`bg-primary`, `text-foreground`, `border-border`). Never use raw color values (`#fff`, `oklch(...)`, `rgb(...)`) in components.
2. **Never redefine `chrome-*` tokens** in `src/index.css`. They are owned by shared-ui.
3. **Use shared-ui components** (Button, Input, Card, etc.) from `@haderach/shared-ui` for standard UI elements. They already reference the correct tokens.
4. **App-specific components** should use app-level tokens, not hardcoded neutrals or arbitrary Tailwind values.
5. **GlobalNav is self-contained** — it uses only chrome tokens. Do not pass app-level token classes to it.

## Source of Truth

- Platform chrome tokens: `@haderach/shared-ui/theme` (owned by `haderach-home` repo)
- App tokens: `src/index.css` `@theme` block
- Shared components: `@haderach/shared-ui` (imported via `file:` protocol)
