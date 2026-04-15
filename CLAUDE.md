# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16 App Router** project using React 19, Tailwind CSS v4, and Framer Motion.

**Key conventions:**
- Each section/component lives in `src/components/<ComponentName>/` with a `.js` file and a co-located `.module.css` file for scoped styles
- `src/app/page.js` is the single-page entry — it imports and composes section components vertically
- `src/app/globals.css` contains only `@import "tailwindcss"` — global styles are minimal; prefer CSS Modules per component
- `src/app/layout.js` sets the root fonts (Geist Sans + Geist Mono via `next/font/google`) and wraps all pages

**Current sections (in render order):**
- `Header` — sticky nav with profile picture, anchor links, and "Let's Talk" CTA button
- `Hero` — full-viewport intro with name, role, and tagline
- `Work` — project cards section (shell only, cards not yet implemented)

**Design system (from planning.txt — "Warm Mid-Tone Glass" palette):**
- Background: `#5f5148`, Foreground: `#fefcfb`
- Surface: `color-mix(in oklab, #836b5c 70%, transparent)` (semi-transparent cards)
- Muted text: `#efe8e1`, Accent 1 (cyan): `#22d3ee`, Accent 2 (orange): `#f97316`
- Note: current component CSS still uses the old light palette (`#f2f1ef`, `#413f3d`, `#697184`) — the planned palette above has not been fully applied yet

**Static assets:** Profile image (`/Profile.jpg`) lives in `public/` and is served at the root path.
