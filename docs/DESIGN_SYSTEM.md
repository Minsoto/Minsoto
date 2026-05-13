# Minsoto — Design System

*v2.0 · May 2026*

---

## Philosophy

> Minimal. Legible. Calm.

Minsoto's visual identity is built on restraint. The interface should never compete with the content. Typography and whitespace do the heavy lifting; color is used sparingly to create focus, not decoration.

---

## Tokens (CSS variables — `globals.css`)

### Color

```css
/* Backgrounds */
--background          /* primary page background */
--surface             /* card / panel background */
--surface-hover       /* hover state for interactive surfaces */

/* Text */
--text-primary        /* white/90 — primary readable text */
--text-secondary      /* white/50 — secondary, labels */
--text-muted          /* white/25–30 — timestamps, metadata */
--text-dim            /* white/15 — placeholder-level */

/* Accents (used sparingly) */
--accent-cyan         /* #22d3ee — links, active states */
--accent-purple       /* #a855f7 — gradient pair */

/* Gradients */
--gradient-mesh       /* radial ambient background gradient */
```

### Spacing

The layout uses a 4px base unit. All padding and margins are multiples of 4.

Common values: `4px · 8px · 12px · 16px · 20px · 24px · 32px · 40px · 48px`

### Typography

```css
/* Primary: Geist Sans (variable font, loaded via next/font) */
--font-geist-sans

/* Monospace: Geist Mono (code blocks, slugs) */
--font-geist-mono
```

Scale:
| Role | Size | Weight |
|---|---|---|
| Page heading | `text-xl` (20px) | `font-medium` |
| Section label | `text-sm` (14px) | `font-medium` |
| Body / entries | `text-sm` (14px) | `font-normal` |
| Metadata | `text-xs` (12px) | `font-normal` |
| Section nav label | `text-xs` tracking-widest | `uppercase` |

### Radii

```css
rounded-lg    /* 8px  — buttons, inputs, small cards */
rounded-xl    /* 12px — modal panels, medium cards */
rounded-2xl   /* 16px — large cards, browse grid */
rounded-full  /* pills, avatar circles */
```

---

## Components

### `glass-nav`
Fixed top navigation bar. Backdrop blur + very low opacity background. Used in `Navigation.tsx`.

```css
.glass-nav {
  background: rgba(var(--background-rgb), 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

### `glass-panel`
Card / panel surface. Slightly elevated from background.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}
```

### `glass-card`
Lighter version for nested or smaller cards.

---

## Motion

All animations use `framer-motion`. Standard tokens:

| Use | Config |
|---|---|
| Page element enter | `initial: { opacity: 0, y: 12 }` · `duration: 0.4` |
| Staggered list | `delay: index * 0.04` |
| Modal enter | `scale: 0.96 → 1` · `duration: 0.15` |
| Content swap (AnimatePresence) | `mode: "wait"` · `duration: 0.35` |
| Nav indicator | `layoutId: "nav-indicator"` · spring stiffness 400 |

---

## Layout

### Max widths

| Context | Max width |
|---|---|
| Journal page, write, settings | `max-w-2xl` (672px) |
| Resources browse, dashboard | `max-w-4xl` (896px) |
| Dashboard full | `max-w-6xl` (1152px) |

All pages use `px-4` on mobile, centered with `mx-auto`.

### Navigation height

`h-16` (64px) fixed. Pages offset with `pt-28` (112px = 64px nav + 48px breathing room) or `h-16` spacer div.

---

## Identity colors

Avatar initials use a consistent gradient:
```css
background: linear-gradient(to bottom right, rgba(34,211,238,0.8), rgba(168,85,247,0.8));
```
Cyan `#22d3ee` → Violet `#a855f7`. Never changes per user — anonymity by design.

---

## Writing / content styles

Markdown is rendered with `react-markdown` + `prose prose-sm prose-invert` (Tailwind Typography compatible class names via the widget). Line height is `leading-relaxed` throughout for readability.

Entry previews strip Markdown syntax characters (`#`, `*`, `` ` ``, `_`, etc.) before truncating at 280 characters.

---

## Dark mode only

Minsoto is dark-mode only. There is no light theme. The aesthetic is intentional — calm, focused, screen-comfortable for late-night writing.
