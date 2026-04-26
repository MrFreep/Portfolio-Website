# Light Burst Intro — Design Spec

## Goal

Replace the existing cinematic intro (warp/space animation) with a Light Burst reveal: a radial wave of light expands from center screen, revealing hero content layer by layer as it passes over each element. Professional, memorable, high-depth, cinematic (~2.8s).

---

## What Gets Removed

| File | Action |
|------|--------|
| `src/components/UI/PageLoader.js` | Delete |
| `src/components/UI/CinematicIntro.js` | Delete |
| `src/components/UI/CinematicCanvas.js` | Delete |
| `src/components/UI/PageReveal.js` | Delete |

All `cinematic-start` and `cinematic-done` custom events are eliminated. No event-based coordination between components.

---

## What Changes

### `src/components/UI/SpaceCanvas.js`
Strip out all warp/settling logic. The canvas starts immediately in ambient mode (twinkling stars, gentle uniform pan). The component becomes ~60 lines. No event listeners.

### `src/app/layout.js`
Remove imports of `PageLoader`, `CinematicIntro`, `PageReveal`. Keep `SpaceCanvas`, `SmoothScroll`, `CustomCursor`, `ScrollProgress`, `EasterEgg`.

### `src/components/Hero/Hero.js`
Replace the `introReady` / event-gating pattern with a self-contained `LightBurst` component that manages the reveal. Hero renders normally; the burst overlay sits on top and fades away as content is revealed beneath it.

### `src/components/Header/Header.js`
Replace `cinematic-done` event listener with a simple `useEffect` timeout (`setTimeout(() => setReady(true), 2800)`) so the header slides in at 2.8s regardless.

---

## New Component: `LightBurstIntro`

**File:** `src/components/UI/LightBurstIntro.js`

A self-contained overlay component that:
1. Mounts on top of everything (`position: fixed`, `z-index: 99998`, `pointer-events: none`)
2. Runs the burst animation
3. Unmounts itself when done

### Animation Sequence

| Time | Event |
|------|-------|
| 0.0s | Component mounts. Overlay present. Hero content at `opacity: 0`, `filter: blur(20px)`. |
| 0.1s | Pinpoint of white light appears at viewport center (`width: 4px`, `height: 4px`, `border-radius: 50%`). |
| 0.1 → 1.2s | Wave div animates `scale: 0 → 40`. Radial gradient: white core → cyan ring → orange fade → transparent. |
| ~0.5s | Name layer begins sharpening (`blur: 20px → 0`, `opacity: 0 → 1`, duration 1.0s). |
| ~0.8s | Role/typewriter layer sharpens (delay 0.3s after name). |
| ~1.1s | Tagline + buttons sharpen (delay 0.3s after role). |
| 1.4s | Wave finishes expanding. Overlay div fades out (`opacity: 0`, duration 0.4s). |
| 1.8s | Overlay unmounts. |
| 2.8s | Header slides in (handled by Header's own timeout). |

### Wave Element

```
position: fixed
inset: 0
pointer-events: none
z-index: 99998

Inner wave div:
  position: absolute
  top: 50%, left: 50%
  transform: translate(-50%, -50%) scale(0 → 40)
  width: 60px, height: 60px
  border-radius: 50%
  background: radial-gradient(
    circle,
    rgba(255,255,255,0.95) 0%,
    rgba(34,211,238,0.6) 20%,
    rgba(249,115,22,0.25) 50%,
    transparent 70%
  )
```

### Hero Content Reveal

Each hero layer is a `motion.div` with:
- `initial={{ opacity: 0, filter: 'blur(20px)' }}`
- `animate={{ opacity: 1, filter: 'blur(0px)' }}`
- Staggered `transition.delay` values (0.5s / 0.8s / 1.1s)

The name layer also animates `scale: 1.04 → 1.0` for a subtle depth-into-focus feel.

### Layers (inside Hero)

1. **Name** — `AnimatedName` — delay 0.5s, also scale 1.04 → 1
2. **Typewriter row** — delay 0.8s
3. **Tagline** — delay 1.1s
4. **Buttons** — delay 1.3s

---

## Background

`SpaceCanvas` stays as the persistent ambient star field. Warp code is fully removed. Stars twinkle and drift uniformly from the moment the page loads — they are visible through/behind the light burst (the burst overlay does not cover the canvas, which sits at `z-index: 0`).

---

## Mobile Behaviour

On `pointer: coarse` devices (touch/mobile), `LightBurstIntro` skips the burst entirely — the hero content starts at `opacity: 0` and immediately transitions to `opacity: 1` with a simple 0.5s fade. Header timeout is reduced to 0.6s on mobile.

---

## Architecture Summary

```
layout.js
├── SpaceCanvas          (z-index: 0, always ambient)
├── LightBurstIntro      (z-index: 99998, unmounts at ~1.8s)
├── EasterEgg
├── CustomCursor
├── ScrollProgress
└── SmoothScroll
    └── children
        ├── Header       (slides in at 2.8s via timeout)
        └── page.js
            ├── Hero     (content revealed by burst timing)
            └── ...sections
```

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/UI/PageLoader.js` | Delete |
| `src/components/UI/CinematicIntro.js` | Delete |
| `src/components/UI/CinematicCanvas.js` | Delete |
| `src/components/UI/PageReveal.js` | Delete |
| `src/components/UI/SpaceCanvas.js` | Rewrite — ambient only |
| `src/components/UI/LightBurstIntro.js` | Create |
| `src/components/Hero/Hero.js` | Remove event gating, add blur layer delays |
| `src/components/Header/Header.js` | Replace event listener with setTimeout |
| `src/app/layout.js` | Remove deleted components, add LightBurstIntro |
| `src/__tests__/CinematicIntro.test.js` | Replace with LightBurstIntro tests |
