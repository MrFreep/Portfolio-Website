# Cinematic Intro Design

## Goal

Add a 4.5-second cinematic opening sequence that plays once on every page load, bridging the existing page loader into the hero section with a big bang → warp → settle → lens flare reveal.

## Architecture

Three components are modified/created:

- **`src/components/UI/CinematicIntro.js`** — new, full-screen R3F canvas that owns the entire sequence
- **`src/components/UI/PageLoader.js`** — modified to dispatch a `cinematic-start` custom event when its exit animation finishes
- **`src/components/Hero/Hero.js`** — modified to delay name/content animations until a `cinematic-done` custom event fires
- **`src/app/layout.js`** — add `<CinematicIntro />` alongside `<PageLoader />`

Coordination is done entirely via `window` custom events — no shared state, no prop drilling, no context.

## Sequence & Timing

| Phase | Time | Description |
|---|---|---|
| BANG | 0.0 – 0.8s | 2000 particles burst from origin, moving outward radially. Bloom intensity: high (4.0). Colors: white/cyan core. |
| WARP | 0.8 – 2.5s | Particles accelerate. Each renders as a line segment from current position back along its velocity vector (stretch factor peaks at ~0.8). Colors shift toward cyan/orange. Bloom intensity: 3.5. |
| SETTLE | 2.5 – 4.0s | Particles decelerate and lerp toward their final star positions. Stretch factor lerps to 0. LensFlare point sweeps left-to-right. Bloom eases down to 1.6. |
| FADEOUT | 4.0 – 4.5s | Canvas opacity animates from 1 → 0 via Framer Motion. On complete, dispatches `cinematic-done` and unmounts. |

## CinematicIntro Component

```
CinematicIntro
├── listens for window 'cinematic-start' event to begin
├── <motion.div> wrapper — handles FADEOUT opacity animation
└── <Canvas> — position: fixed, inset: 0, z-index: 99998, pointerEvents: none
    ├── <WarpField />
    ├── <LensFlare />   (renders only during SETTLE phase)
    └── <EffectComposer>
            <Bloom intensity={bloomIntensity} ... />
        </EffectComposer>
```

### WarpField

- Holds a `useRef` phase state machine: `'idle' | 'bang' | 'warp' | 'settle' | 'done'`
- `useRef` for phase start time per phase
- 2000 particles stored in `useRef` arrays:
  - `positions` Float32Array (2000 * 3) — current XYZ
  - `velocities` Float32Array (2000 * 3) — current velocity
  - `targets` Float32Array (2000 * 3) — settled star positions (randomised on mount, same distribution as BackgroundParticles)
  - `tailPositions` Float32Array (2000 * 3) — tail end of each line segment (for WARP phase)
- Rendered as `THREE.BufferGeometry` Points during BANG/SETTLE, switches to line segments (`THREE.LineSegments`) during WARP
  - Line segment geometry interleaves head and tail: `[head0, tail0, head1, tail1, ...]` — total 4000 * 3 floats
- `useFrame` drives all phase transitions and position updates
- Exposes current `bloomIntensity` via a shared ref passed down from parent

### LensFlare

- Single `THREE.Points` mesh with one oversized point (size: 2.5)
- Position sweeps from `[-14, randomY, 1]` to `[14, randomY, 1]` over 1.5s during SETTLE phase
- Color: white, bloom makes it glow
- Hidden outside SETTLE phase

### Bloom intensity schedule

Parent component holds a `bloomRef = useRef(4.0)`. WarpField writes to it each frame based on phase progress. EffectComposer reads it via a custom `BloomController` child that calls `useFrame` and updates the Bloom effect's intensity.

## PageLoader Changes

After the exit animation transition completes (the `onExitComplete` or equivalent), dispatch:
```js
window.dispatchEvent(new CustomEvent('cinematic-start'))
```

Use AnimatePresence's `onExitComplete` on the outer AnimatePresence wrapper to fire this after the fade is fully done.

## Hero Changes

Hero currently starts name animations at `delay: 0.8` from mount. Change this so:
- On mount, Hero listens for `cinematic-done` event
- Until that event fires, all animation delays are held at their initial (hidden) state
- When `cinematic-done` fires, Hero starts its normal animation sequence (name drop, typewriter, tagline, buttons)
- Use a `useState(false)` for `introReady` — set to `true` on `cinematic-done`
- Pass `introReady` as a condition: animations only `animate` when `introReady === true`

## Styling

- Canvas: `position: fixed`, `inset: 0`, `z-index: 99998`, `pointerEvents: none`
- Sits below PageLoader (z-index: 99999) and above everything else
- On mobile (`pointer: coarse`): skip the cinematic entirely, dispatch `cinematic-done` immediately on `cinematic-start` so Hero animations play normally

## Non-Goals

- No skip button (can add later if needed)
- No sound
- No per-visit "already seen" suppression — plays every reload as discussed
