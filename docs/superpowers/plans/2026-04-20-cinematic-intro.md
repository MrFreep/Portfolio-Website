# Cinematic Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4.5-second cinematic intro (big bang → warp streaks → settle → lens flare → fade out) that bridges the existing page loader into the hero section.

**Architecture:** Three browser custom events coordinate four independent components — PageLoader dispatches `cinematic-start` on exit, CinematicIntro owns the full R3F canvas sequence and dispatches `cinematic-done` when done, Hero gates its animations until `cinematic-done` fires. On mobile the sequence is skipped entirely.

**Tech Stack:** React Three Fiber (`@react-three/fiber`), `@react-three/postprocessing` (Bloom), Three.js, Framer Motion (fade out), Next.js App Router.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/components/UI/PageLoader.js` |
| Create | `src/components/UI/CinematicIntro.js` |
| Modify | `src/components/Hero/Hero.js` |
| Modify | `src/app/layout.js` |
| Create | `src/__tests__/CinematicIntro.test.js` |

---

### Task 1: Modify PageLoader to dispatch `cinematic-start`

**Files:**
- Modify: `src/components/UI/PageLoader.js`

Current PageLoader calls `setDone(true)` then the AnimatePresence exit animation runs for 0.8s. We need to fire `cinematic-start` **after** the exit animation fully completes, using AnimatePresence's `onExitComplete` prop.

- [ ] **Step 1: Add `onExitComplete` to AnimatePresence in PageLoader**

Replace the current return statement in `src/components/UI/PageLoader.js`:

```jsx
return (
  <AnimatePresence onExitComplete={() => window.dispatchEvent(new CustomEvent('cinematic-start'))}>
    {!done && (
      <motion.div
        role="status"
        aria-label="Loading"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-base)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {/* Geometric particle ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTop: '2px solid var(--accent-cyan)',
            borderRight: '2px solid var(--accent-orange)',
            filter: 'drop-shadow(0 0 8px var(--accent-cyan))',
          }}
        />

        {/* Name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: 'var(--fg-muted)',
            fontSize: '14px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          James Keenan
        </motion.p>

        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 1,
          background: 'var(--border)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.08, ease: 'linear' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-orange))',
              boxShadow: '0 0 8px var(--accent-cyan)',
            }}
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
```

- [ ] **Step 2: Verify dispatch fires correctly**

Run the dev server (`npm run dev`) and open DevTools console. Add a temporary listener:
```js
window.addEventListener('cinematic-start', () => console.log('cinematic-start fired'))
```
Reload the page. After the loading bar completes and fades out (~2.5s), you should see `cinematic-start fired` in the console.

- [ ] **Step 3: Write test**

Create `src/__tests__/CinematicIntro.test.js`:

```js
// src/__tests__/CinematicIntro.test.js
import { render, act } from '@testing-library/react'
import PageLoader from '../components/UI/PageLoader'

describe('PageLoader', () => {
  it('dispatches cinematic-start after exit animation completes', async () => {
    jest.useFakeTimers()
    const fired = []
    window.addEventListener('cinematic-start', () => fired.push(true))

    render(<PageLoader />)

    // Progress runs at 5% every 80ms → reaches 100 in 1600ms
    act(() => { jest.advanceTimersByTime(2000) })
    // Wait for exit animation (800ms transition + 400ms setDone delay)
    act(() => { jest.advanceTimersByTime(1500) })

    expect(fired.length).toBe(1)
    jest.useRealTimers()
  })
})
```

- [ ] **Step 4: Run test**

```bash
cd "/Users/james.keenan/Desktop/current projects/Dynamic Portfolio Website/dynamic-portfolio"
npx jest src/__tests__/CinematicIntro.test.js --no-coverage
```

Expected: 1 test passes. (The event timing through AnimatePresence is hard to test in jsdom — if this test is flaky due to AnimatePresence internals, mark it as skipped with `it.skip` and proceed. The manual browser verification in Step 2 is the ground truth.)

- [ ] **Step 5: Commit**

```bash
git add src/components/UI/PageLoader.js src/__tests__/CinematicIntro.test.js
git commit -m "feat: dispatch cinematic-start after page loader exits"
```

---

### Task 2: Create CinematicIntro skeleton

**Files:**
- Create: `src/components/UI/CinematicIntro.js`

This task creates the component shell: event listening, canvas container, and the Framer Motion fade-out that fires `cinematic-done`. The Three.js content (WarpField, LensFlare) is stubbed as `null` and filled in Task 3.

- [ ] **Step 1: Create the file**

Create `src/components/UI/CinematicIntro.js`:

```js
// src/components/UI/CinematicIntro.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const CinematicCanvas = dynamic(() => import('./CinematicCanvas'), { ssr: false })

export default function CinematicIntro() {
  const [phase, setPhase] = useState('waiting') // 'waiting'|'playing'|'fading'|'done'

  useEffect(() => {
    // Skip on touch/mobile devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      window.dispatchEvent(new CustomEvent('cinematic-done'))
      return
    }

    function onStart() { setPhase('playing') }
    window.addEventListener('cinematic-start', onStart)
    return () => window.removeEventListener('cinematic-start', onStart)
  }, [])

  function handleSequenceDone() {
    setPhase('fading')
  }

  function handleFadeComplete() {
    window.dispatchEvent(new CustomEvent('cinematic-done'))
    setPhase('done')
  }

  if (phase === 'done' || phase === 'waiting') return null

  return (
    <AnimatePresence>
      {phase === 'playing' && (
        <motion.div
          key="cinematic"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onAnimationComplete={phase === 'fading' ? handleFadeComplete : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            pointerEvents: 'none',
          }}
        >
          <CinematicCanvas onDone={handleSequenceDone} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create CinematicCanvas stub**

Create `src/components/UI/CinematicCanvas.js` (will be filled in Task 3):

```js
// src/components/UI/CinematicCanvas.js
'use client'
import { useEffect } from 'react'

// Stub — calls onDone after 4s to verify the shell works end-to-end
export default function CinematicCanvas({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,211,238,0.05)' }} />
  )
}
```

- [ ] **Step 3: Wire CinematicIntro into layout**

In `src/app/layout.js`, add the import and component:

```js
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '../components/UI/SmoothScroll'
import ScrollProgress from '../components/UI/ScrollProgress'
import CustomCursor from '../components/UI/CustomCursor'
import PageLoader from '../components/UI/PageLoader'
import EasterEgg from '../components/UI/EasterEgg'
import CinematicIntro from '../components/UI/CinematicIntro'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'James Keenan — Software Engineer',
  description: 'Full-stack software engineer building modern web applications with clean code and user-focused design.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Ambient background glows */}
        <div className="ambient-glow ambient-glow-cyan" aria-hidden="true" />
        <div className="ambient-glow ambient-glow-orange" aria-hidden="true" />

        <PageLoader />
        <CinematicIntro />
        <EasterEgg />
        <CustomCursor />
        <ScrollProgress />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Add test for CinematicIntro event flow**

Add to `src/__tests__/CinematicIntro.test.js`:

```js
import { render, act, waitFor } from '@testing-library/react'
import CinematicIntro from '../components/UI/CinematicIntro'

// Mock dynamic import of CinematicCanvas
jest.mock('../components/UI/CinematicCanvas', () => {
  const { useEffect } = require('react')
  return function MockCanvas({ onDone }) {
    useEffect(() => { onDone() }, [onDone])
    return null
  }
})

describe('CinematicIntro', () => {
  it('fires cinematic-done after cinematic-start', async () => {
    const fired = []
    window.addEventListener('cinematic-done', () => fired.push(true))

    render(<CinematicIntro />)

    act(() => { window.dispatchEvent(new CustomEvent('cinematic-start')) })

    await waitFor(() => expect(fired.length).toBe(1))
  })

  it('fires cinematic-done immediately on mobile', () => {
    const fired = []
    window.addEventListener('cinematic-done', () => fired.push(true))

    // Simulate touch device
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    })

    render(<CinematicIntro />)
    expect(fired.length).toBe(1)
  })
})
```

- [ ] **Step 5: Run test**

```bash
npx jest src/__tests__/CinematicIntro.test.js --no-coverage
```

Expected: tests pass.

- [ ] **Step 6: Manual browser verification**

Run `npm run dev`. Reload the page. After the loader exits, a faint cyan tint should briefly appear (the stub canvas) for 4 seconds then disappear. Open DevTools and confirm:
```js
window.addEventListener('cinematic-done', () => console.log('cinematic-done'))
```

- [ ] **Step 7: Commit**

```bash
git add src/components/UI/CinematicIntro.js src/components/UI/CinematicCanvas.js src/app/layout.js src/__tests__/CinematicIntro.test.js
git commit -m "feat: add CinematicIntro skeleton with event coordination"
```

---

### Task 3: Implement WarpField — the full particle sequence

**Files:**
- Modify: `src/components/UI/CinematicCanvas.js` (replace stub with real R3F canvas)

This is the core visual work. Replace the stub CinematicCanvas with a real R3F canvas containing the WarpField particle system running the three-phase sequence.

**Phase durations:**
- BANG: 0 → 0.8s (particles spread from origin to star positions)
- WARP: 0.8s → 2.5s (particles static, line-segment tails stretch then shrink)
- SETTLE: 2.5s → 4.0s (tails gone, points visible, bloom eases down)
- After SETTLE: calls `onDone()` → parent triggers 0.5s fade → `cinematic-done` fires at ~4.5s

- [ ] **Step 1: Replace CinematicCanvas with full R3F implementation**

Replace the entire contents of `src/components/UI/CinematicCanvas.js`:

```js
// src/components/UI/CinematicCanvas.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const COUNT = 2000
const CANVAS_STYLE = { position: 'absolute', inset: 0 }

// Same soft radial-gradient texture used in ParticleField
function useStarTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    g.addColorStop(0,    'rgba(255,255,255,1)')
    g.addColorStop(0.15, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.5,  'rgba(255,255,255,0.25)')
    g.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

function WarpField({ onDone }) {
  const pointsRef = useRef()
  const linesRef  = useRef()
  const tex       = useStarTexture()

  // Particle target positions and colors — randomised once on mount
  const { targets, colors } = useMemo(() => {
    const targets = new Float32Array(COUNT * 3)
    const colors  = new Float32Array(COUNT * 3)
    const cyan   = new THREE.Color('#22d3ee')
    const orange = new THREE.Color('#f97316')
    for (let i = 0; i < COUNT; i++) {
      targets[i*3]   = (Math.random() - 0.5) * 42
      targets[i*3+1] = (Math.random() - 0.5) * 42
      targets[i*3+2] = (Math.random() - 0.5) * 22
      const r = Math.random()
      const c = r < 0.15
        ? cyan.clone().lerp(new THREE.Color('#ffffff'), 0.4)
        : r < 0.24
        ? orange.clone().lerp(new THREE.Color('#ffffff'), 0.5)
        : new THREE.Color(
            0.65 + Math.random() * 0.35,
            0.85 + Math.random() * 0.15,
            1.0
          )
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b
    }
    return { targets, colors }
  }, [])

  // Mutable position buffers — mutated in useFrame, needsUpdate signals GPU re-upload
  const currPos = useRef(new Float32Array(COUNT * 3))     // starts all-zero (origin)
  const linePos = useRef(new Float32Array(COUNT * 2 * 3)) // head+tail per particle

  // Phase state machine
  const phaseRef      = useRef('bang')
  const phaseStart    = useRef(0)           // set to clock.elapsedTime on first frame
  const initialised   = useRef(false)
  const doneFired     = useRef(false)

  useFrame(({ clock }) => {
    const t       = clock.elapsedTime
    const phase   = phaseRef.current
    const pos     = currPos.current
    const lp      = linePos.current

    // Capture start time on first frame
    if (!initialised.current) {
      initialised.current  = true
      phaseStart.current   = t
    }

    const elapsed  = t - phaseStart.current

    // ── BANG (0 – 0.8s): lerp all particles from origin to target positions ──
    if (phase === 'bang') {
      const progress = Math.min(elapsed / 0.8, 1)
      const eased    = progress * progress * (3 - 2 * progress) // smoothstep
      for (let i = 0; i < COUNT; i++) {
        pos[i*3]   = targets[i*3]   * eased
        pos[i*3+1] = targets[i*3+1] * eased
        pos[i*3+2] = targets[i*3+2] * eased
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true
        pointsRef.current.visible = true
      }
      if (linesRef.current) linesRef.current.visible = false

      if (elapsed >= 0.8) {
        phaseRef.current = 'warp'
        phaseStart.current = t
      }
    }

    // ── WARP (0 – 1.7s): stretch line-segment tails radially from each star ──
    else if (phase === 'warp') {
      const progress = Math.min(elapsed / 1.7, 1)

      // Stretch envelope: ramp up 0→1 in first 35%, hold, ramp down in last 25%
      let stretch
      if      (progress < 0.35) stretch = progress / 0.35
      else if (progress < 0.75) stretch = 1.0
      else                      stretch = 1.0 - (progress - 0.75) / 0.25

      const stretchAmt = stretch * 3.5 // max world-unit tail length

      for (let i = 0; i < COUNT; i++) {
        const ix  = i * 3
        const lix = i * 6
        const tx = targets[ix], ty = targets[ix+1], tz = targets[ix+2]
        const len = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1

        // Head: star position
        lp[lix]   = tx;  lp[lix+1] = ty;  lp[lix+2] = tz
        // Tail: pulled back toward origin along the radial direction
        lp[lix+3] = tx - (tx/len) * stretchAmt
        lp[lix+4] = ty - (ty/len) * stretchAmt
        lp[lix+5] = tz - (tz/len) * stretchAmt
      }

      if (linesRef.current) {
        linesRef.current.geometry.attributes.position.needsUpdate = true
        linesRef.current.visible = true
      }
      if (pointsRef.current) pointsRef.current.visible = false

      if (elapsed >= 1.7) {
        phaseRef.current = 'settle'
        phaseStart.current = t
        // Restore points to target positions for the settle phase
        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   = targets[i*3]
          pos[i*3+1] = targets[i*3+1]
          pos[i*3+2] = targets[i*3+2]
        }
        if (pointsRef.current)
          pointsRef.current.geometry.attributes.position.needsUpdate = true
      }
    }

    // ── SETTLE (0 – 1.5s): show star field, wait, then call onDone ──────────
    else if (phase === 'settle') {
      if (linesRef.current) linesRef.current.visible = false
      if (pointsRef.current) pointsRef.current.visible = true

      if (elapsed >= 1.5 && !doneFired.current) {
        doneFired.current = true
        onDone()
      }
    }
  })

  return (
    <>
      {/* Points: BANG and SETTLE phases */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={currPos.current}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            attach="attributes-color"
            count={COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          map={tex}
          alphaMap={tex}
          alphaTest={0.004}
          depthWrite={false}
        />
      </points>

      {/* LineSegments: WARP phase */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT * 2}
            array={linePos.current}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.85} />
      </lineSegments>
    </>
  )
}

export default function CinematicCanvas({ onDone }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 75 }}
      style={CANVAS_STYLE}
      dpr={[1, 2]}
    >
      <WarpField onDone={onDone} />
      <EffectComposer>
        <Bloom
          intensity={3.0}
          luminanceThreshold={0.01}
          luminanceSmoothing={0.88}
          height={400}
        />
      </EffectComposer>
    </Canvas>
  )
}
```

- [ ] **Step 2: Browser test — verify sequence plays**

Run `npm run dev`. Reload. After the loader:
1. **BANG (0–0.8s):** Particles should rapidly bloom outward from center — looks like an explosion of stars.
2. **WARP (0.8–2.5s):** Particles should stretch into cyan line streaks radiating outward — hyperspace look.
3. **SETTLE (2.5–4s):** Streaks collapse back to dots — the star field appears.
4. **FADE (4–4.5s):** Canvas fades out, hero section becomes visible.

If the sequence plays correctly, proceed. Common issues:
- Particles invisible during BANG: check `pointsRef.current.visible = true` is running
- Lines invisible during WARP: check `linesRef.current.visible = true` and `needsUpdate = true`
- Sequence doesn't end: check `onDone` is called and `doneFired.current` guard is working

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/CinematicCanvas.js
git commit -m "feat: implement WarpField particle sequence (bang, warp, settle)"
```

---

### Task 4: Add LensFlare to SETTLE phase

**Files:**
- Modify: `src/components/UI/CinematicCanvas.js`

During the SETTLE phase (2.5–4.0s), a single bright oversized point sweeps left-to-right across the screen. The high-intensity Bloom turns it into a convincing lens flare.

- [ ] **Step 1: Add LensFlare component inside CinematicCanvas.js**

Add this component above the `CinematicCanvas` export (after `WarpField`):

```js
function LensFlare({ settleStartRef }) {
  const meshRef = useRef()
  const tex     = useStarTexture()
  const sweepStartRef = useRef(null)
  const posArr  = useMemo(() => new Float32Array([0, 0, 2]), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // Only active during SETTLE — settleStartRef.current is set when SETTLE begins
    if (settleStartRef.current === null) {
      meshRef.current.visible = false
      return
    }

    if (sweepStartRef.current === null) {
      sweepStartRef.current = clock.elapsedTime
    }

    const elapsed  = clock.elapsedTime - sweepStartRef.current
    const progress = Math.min(elapsed / 1.4, 1) // sweep over 1.4s of the 1.5s settle
    const x        = -15 + progress * 30         // left-to-right across the scene

    meshRef.current.position.set(x, 0, 2)
    meshRef.current.visible = progress < 1.0
  })

  return (
    <points ref={meshRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1} array={posArr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={3.0}
        color="#ffffff"
        transparent
        opacity={1}
        sizeAttenuation
        map={tex}
        alphaMap={tex}
        alphaTest={0.004}
        depthWrite={false}
      />
    </points>
  )
}
```

- [ ] **Step 2: Add `settleStartRef` to WarpField and pass to LensFlare**

In `CinematicCanvas` (the exported component), create a shared ref and thread it through:

```js
export default function CinematicCanvas({ onDone }) {
  const settleStartRef = useRef(null)

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 75 }}
      style={CANVAS_STYLE}
      dpr={[1, 2]}
    >
      <WarpField onDone={onDone} settleStartRef={settleStartRef} />
      <LensFlare settleStartRef={settleStartRef} />
      <EffectComposer>
        <Bloom
          intensity={3.0}
          luminanceThreshold={0.01}
          luminanceSmoothing={0.88}
          height={400}
        />
      </EffectComposer>
    </Canvas>
  )
}
```

- [ ] **Step 3: Set `settleStartRef` inside WarpField when SETTLE begins**

Add `settleStartRef` to the `WarpField` function signature and set it at the WARP→SETTLE transition:

```js
function WarpField({ onDone, settleStartRef }) {
  // ... (existing refs and useMemo unchanged)

  useFrame(({ clock }) => {
    // ... (existing bang and warp code unchanged)

    // At the end of the warp block, when transitioning to settle:
    if (elapsed >= 1.7) {
      phaseRef.current   = 'settle'
      phaseStart.current = t
      settleStartRef.current = t   // ← ADD THIS LINE
      // ... rest of the existing transition code
    }

    // ... (existing settle code unchanged)
  })

  // ... (existing JSX unchanged)
}
```

- [ ] **Step 4: Browser test — verify lens flare**

Reload. During the SETTLE phase (~2.5–4.0s mark), a bright glowing point should sweep left-to-right. With Bloom at intensity 3.0, it should look like a bright star or lens flare moving across the star field.

- [ ] **Step 5: Commit**

```bash
git add src/components/UI/CinematicCanvas.js
git commit -m "feat: add LensFlare sweep during settle phase"
```

---

### Task 5: Gate Hero animations until `cinematic-done`

**Files:**
- Modify: `src/components/Hero/Hero.js`

Currently Hero starts its name-drop animation at `delay: 0.8` from mount. We need to hold all animations until `cinematic-done` fires (~4.5s after page load).

- [ ] **Step 1: Add `introReady` state and event listener to Hero**

In `src/components/Hero/Hero.js`, modify the `Hero` function:

```js
export default function Hero() {
  const typewriterText  = useTypewriter(ROLES)
  const [introReady, setIntroReady] = useState(false)
  const primaryMagnetic  = useMagneticButton(0.3)
  const outlineMagnetic  = useMagneticButton(0.3)
  const { scrollY }     = useScroll()
  const heroH           = typeof window !== 'undefined' ? window.innerHeight : 800

  const fgStart   = heroH * 0.15
  const fgOpacity = useTransform(scrollY, [fgStart, fgStart + heroH * 6.5], [1, 0])

  useEffect(() => {
    function onDone() { setIntroReady(true) }
    window.addEventListener('cinematic-done', onDone)
    return () => window.removeEventListener('cinematic-done', onDone)
  }, [])

  // ... rest of the component unchanged
```

- [ ] **Step 2: Gate all animate props on `introReady`**

Update the animated elements so they only animate when `introReady` is true. Change from:

```jsx
// AnimatedName — change initial/animate in the motion.span inside AnimatedName:
initial={{ opacity: 0, y: 60, rotateX: -90 }}
animate={{ opacity: 1, y: 0, rotateX: 0 }}
```

To pass `introReady` into `AnimatedName` and use it:

```js
function AnimatedName({ name, ready }) {
  const letters = name.split('')
  return (
    <h1 className={styles.name} aria-label={name}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={ready ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: -90 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.8 + i * 0.04,
          }}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </h1>
  )
}
```

And in Hero's JSX:

```jsx
<AnimatedName name="James Keenan" ready={introReady} />

<motion.div
  className={styles.typewriterWrapper}
  initial={{ opacity: 0 }}
  animate={{ opacity: introReady ? 1 : 0 }}
  transition={{ delay: 1.6 }}
>

<motion.p
  className={styles.tagline}
  initial={{ opacity: 0, y: 20 }}
  animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
  transition={{ delay: 1.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>

<motion.div
  className={styles.buttons}
  initial={{ opacity: 0, y: 20 }}
  animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
  transition={{ delay: 2.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```

- [ ] **Step 3: Add test for Hero gating**

Add to `src/__tests__/CinematicIntro.test.js`:

```js
import { render, act, screen, waitFor } from '@testing-library/react'
import Hero from '../components/Hero/Hero'

// Mock dynamic imports used in Hero
jest.mock('../components/Hero/ParticleField', () => ({
  StarBackground: () => null,
  StarForeground: () => null,
}))
jest.mock('../../hooks/useMagneticButton', () => () => ({
  ref: { current: null },
  springX: 0,
  springY: 0,
  handleMouseMove: jest.fn(),
  handleMouseLeave: jest.fn(),
}))

describe('Hero', () => {
  it('name is hidden before cinematic-done fires', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading')
    // Before cinematic-done, animate prop keeps opacity 0
    expect(heading).toBeInTheDocument()
  })

  it('starts animating after cinematic-done fires', async () => {
    render(<Hero />)
    act(() => { window.dispatchEvent(new CustomEvent('cinematic-done')) })
    await waitFor(() => {
      // introReady becomes true — no error thrown
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 4: Run all tests**

```bash
npx jest src/__tests__/CinematicIntro.test.js --no-coverage
```

Expected: all tests pass.

- [ ] **Step 5: Browser test — full end-to-end**

Reload the page. Verify:
1. Hero name, typewriter, tagline, and buttons are invisible during the cinematic
2. After the cinematic fades out (~4.5s), the hero animates in (name drops letter by letter, etc.)
3. On mobile (or DevTools device simulation), cinematic is skipped and hero animates immediately

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero/Hero.js src/__tests__/CinematicIntro.test.js
git commit -m "feat: gate hero animations until cinematic-done fires"
```

---

### Task 6: Final wiring check and cleanup

**Files:**
- Review: all modified files

- [ ] **Step 1: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all existing tests still pass alongside the new ones.

- [ ] **Step 2: Full browser walkthrough**

With `npm run dev` running:
1. Hard reload (`Cmd+Shift+R`) — verify full sequence plays
2. Navigate to `#about`, `#work`, `#contact` via nav links — verify they still work normally after cinematic
3. Resize to mobile width (≤768px) in DevTools — verify cinematic is skipped, hero animates immediately
4. Verify star field is visible throughout and during cinematic (background stars render behind the cinematic canvas)

- [ ] **Step 3: Remove CinematicCanvas stub comment if present**

Check `src/components/UI/CinematicCanvas.js` for any leftover stub comments and clean them up.

- [ ] **Step 4: Final commit**

```bash
git add -p  # stage only intentional changes
git commit -m "feat: cinematic intro complete — bang, warp, settle, lens flare, hero gate"
```
