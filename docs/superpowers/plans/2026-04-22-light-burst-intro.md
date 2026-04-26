# Light Burst Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing warp/cinematic intro with a Light Burst reveal — a radial wave of light expands from viewport center, revealing hero content layer by layer through staggered blur-to-sharp animations.

**Architecture:** `LightBurstIntro` is a self-contained fixed overlay that mounts, runs the wave animation, then unmounts. Hero content reveals via independent Framer Motion blur/opacity transitions timed to coincide with the burst. SpaceCanvas is simplified to ambient-only. All custom events (`cinematic-start`, `cinematic-done`) and the PageLoader/PageReveal/CinematicIntro/CinematicCanvas components are deleted.

**Tech Stack:** Framer Motion (`motion`, `useScroll`, `useTransform`), Next.js App Router, React 19. No new libraries.

---

## File Map

| Action | Path |
|--------|------|
| Delete | `src/components/UI/PageLoader.js` |
| Delete | `src/components/UI/CinematicIntro.js` |
| Delete | `src/components/UI/CinematicCanvas.js` |
| Delete | `src/components/UI/PageReveal.js` |
| Delete | `src/__tests__/CinematicIntro.test.js` |
| Rewrite | `src/components/UI/SpaceCanvas.js` |
| Create | `src/components/UI/LightBurstIntro.js` |
| Create | `src/__tests__/LightBurstIntro.test.js` |
| Modify | `src/components/Hero/Hero.js` |
| Modify | `src/components/Header/Header.js` |
| Modify | `src/app/layout.js` |

---

### Task 1: Simplify SpaceCanvas to ambient-only

**Files:**
- Rewrite: `src/components/UI/SpaceCanvas.js`

The current SpaceCanvas has ~200 lines handling three phases (warp, settling, ambient) plus a `cinematic-start` event listener. Strip it to ambient-only — stars twinkle and pan uniformly from the moment the page loads. No events, no warp, no state. Target: ~70 lines.

- [ ] **Step 1: Write the new SpaceCanvas**

Replace the entire contents of `src/components/UI/SpaceCanvas.js`:

```js
// src/components/UI/SpaceCanvas.js
'use client'
import { useEffect, useRef } from 'react'

const STAR_COUNT = 600
const COLORS     = ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#22d3ee', '#f97316']
const PAN_X      = 0.04   // px/frame rightward
const PAN_Y      = 0.015  // px/frame downward

export default function SpaceCanvas() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x      : Math.random() * window.innerWidth,
      y      : Math.random() * window.innerHeight,
      size   : 0.3 + Math.random() * 1.8,
      baseOp : 0.25 + Math.random() * 0.75,
      twSpeed: 0.4 + Math.random() * 1.8,
      twOff  : Math.random() * Math.PI * 2,
      color  : COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let rafId = null

    function drawStar(star, ts) {
      const twinkle = 0.55 + 0.45 * Math.sin(ts * 0.001 * star.twSpeed + star.twOff)
      const a = Math.min(1, star.baseOp * twinkle)
      if (a <= 0) return

      ctx.globalAlpha = a * 0.3
      ctx.fillStyle   = star.color
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 0.55, 0, Math.PI * 2)
      ctx.fill()
    }

    function frame(ts) {
      ctx.clearRect(0, 0, W, H)
      stars.forEach(s => {
        s.x += PAN_X
        s.y += PAN_Y
        if (s.x > W + 5) s.x = -5
        if (s.y > H + 5) s.y = -5
        drawStar(s, ts)
      })
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
```

- [ ] **Step 2: Verify it renders**

Run `npm run dev` in the terminal. Open `http://localhost:3000`. You should see twinkling stars on the dark background moving slowly right-and-down. The page should load with no console errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/james.keenan/Desktop/current projects/Dynamic Portfolio Website/dynamic-portfolio"
git add src/components/UI/SpaceCanvas.js
git commit -m "refactor: simplify SpaceCanvas to ambient-only — remove warp phases and events"
```

---

### Task 2: Create LightBurstIntro component and tests

**Files:**
- Create: `src/components/UI/LightBurstIntro.js`
- Create: `src/__tests__/LightBurstIntro.test.js`

A self-contained fixed overlay. On desktop: renders a circular div at viewport center, animates it from `scale(0)` to `scale(40)` while fading opacity from 1→0 over 1.3s (the "burst"), then unmounts at 1500ms. On mobile (`pointer: coarse`): never mounts, skips the burst silently.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/LightBurstIntro.test.js`:

```js
// src/__tests__/LightBurstIntro.test.js
import { render, act } from '@testing-library/react'
import LightBurstIntro from '../components/UI/LightBurstIntro'

describe('LightBurstIntro', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false }), // desktop
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the burst overlay on desktop', () => {
    const { container } = render(<LightBurstIntro />)
    act(() => {})
    expect(container.firstChild).not.toBeNull()
  })

  it('unmounts after 1500ms on desktop', () => {
    const { container } = render(<LightBurstIntro />)
    act(() => { jest.advanceTimersByTime(1500) })
    expect(container.firstChild).toBeNull()
  })

  it('does not render on mobile (pointer: coarse)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    })
    const { container } = render(<LightBurstIntro />)
    act(() => {})
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd "/Users/james.keenan/Desktop/current projects/Dynamic Portfolio Website/dynamic-portfolio"
npx jest src/__tests__/LightBurstIntro.test.js --no-coverage
```

Expected: FAIL — `Cannot find module '../components/UI/LightBurstIntro'`

- [ ] **Step 3: Create LightBurstIntro**

Create `src/components/UI/LightBurstIntro.js`:

```js
// src/components/UI/LightBurstIntro.js
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LightBurstIntro() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    setShow(true)
    const id = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(id)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position      : 'fixed',
        inset         : 0,
        zIndex        : 99998,
        pointerEvents : 'none',
        overflow      : 'hidden',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 40, opacity: 0 }}
        transition={{
          scale  : { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.1, delay: 0.2, ease: 'easeIn' },
        }}
        style={{
          width       : 60,
          height      : 60,
          borderRadius: '50%',
          background  : 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.6) 20%, rgba(249,115,22,0.25) 50%, transparent 70%)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest src/__tests__/LightBurstIntro.test.js --no-coverage
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/UI/LightBurstIntro.js src/__tests__/LightBurstIntro.test.js
git commit -m "feat: add LightBurstIntro — radial wave overlay, auto-unmounts after 1.5s"
```

---

### Task 3: Rewrite Hero — remove event gating, add burst-timed blur reveals

**Files:**
- Modify: `src/components/Hero/Hero.js`

Remove: `introReady` state, `cinematic-start`/`cinematic-done` event listeners, `ready` prop on `AnimatedName`. Add: `delay` prop to `AnimatedName`, blur/opacity/scale reveals on each content layer timed to coincide with the burst wave, delayed mount of `StarForeground`.

- [ ] **Step 1: Replace Hero.js entirely**

Replace the entire contents of `src/components/Hero/Hero.js`:

```js
// src/components/Hero/Hero.js
'use client'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './hero.module.css'

const StarForeground = dynamic(
  () => import('./ParticleField').then(m => ({ default: m.StarForeground })),
  { ssr: false }
)

const ROLES = ['Software Engineer', 'Full-Stack Developer', 'Problem Solver']

function useTypewriter(words, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex]     = useState(0)
  const [isDeleting, setIsDeleting]   = useState(false)
  const [isPaused, setIsPaused]       = useState(false)

  useEffect(() => {
    if (isPaused) return
    const currentWord = words[wordIndex % words.length]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = currentWord.slice(0, displayText.length + 1)
        setDisplayText(next)
        if (next === currentWord) {
          setIsPaused(true)
          setTimeout(() => { setIsPaused(false); setIsDeleting(true) }, pauseTime)
        }
      } else {
        const next = currentWord.slice(0, displayText.length - 1)
        setDisplayText(next)
        if (next === '') { setIsDeleting(false); setWordIndex(i => i + 1) }
      }
    }, isDeleting ? deleteSpeed : speed)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime])

  return displayText
}

// delay: seconds before letters begin their spring animation
function AnimatedName({ name, delay = 0 }) {
  const letters = name.split('')
  return (
    <h1 className={styles.name} aria-label={name}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            type    : 'spring',
            stiffness: 200,
            damping : 20,
            delay   : delay + i * 0.03,
          }}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </h1>
  )
}

export default function Hero() {
  const typewriterText  = useTypewriter(ROLES)
  const [showFg, setShowFg] = useState(false)
  const primaryMagnetic = useMagneticButton(0.3)
  const outlineMagnetic = useMagneticButton(0.3)
  const { scrollY }     = useScroll()
  const heroH           = typeof window !== 'undefined' ? window.innerHeight : 800

  const fgStart   = heroH * 0.15
  const fgOpacity = useTransform(scrollY, [fgStart, fgStart + heroH * 6.5], [1, 0])

  // Mount foreground stars after the burst overlay has unmounted (~1.8s)
  useEffect(() => {
    const id = setTimeout(() => setShowFg(true), 1800)
    return () => clearTimeout(id)
  }, [])

  return (
    <section id="home" className={styles.hero}>

      {/* Foreground stars — bright + asteroids, appears after burst */}
      {showFg && (
        <motion.div
          className={styles.canvasFg}
          style={{ opacity: fgOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeIn' }}
        >
          <StarForeground />
        </motion.div>
      )}

      <div className={styles.content}>

        {/* Layer 1 — Name: closest to burst center, sharpens first */}
        <motion.div
          initial={{ filter: 'blur(24px)', scale: 1.04 }}
          animate={{ filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedName name="James Keenan" delay={0.5} />
        </motion.div>

        {/* Layer 2 — Role / typewriter */}
        <motion.div
          className={styles.typewriterWrapper}
          initial={{ opacity: 0, filter: 'blur(16px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>{typewriterText}</span>
          <span className={styles.cursor} aria-hidden="true" />
        </motion.div>

        {/* Layer 3 — Tagline */}
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          Building modern web experiences with clean code and purposeful design.
        </motion.p>

        {/* Layer 4 — Buttons */}
        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            ref={primaryMagnetic.ref}
            href="#work"
            className={styles.btnPrimary}
            style={{ x: primaryMagnetic.springX, y: primaryMagnetic.springY }}
            onMouseMove={primaryMagnetic.handleMouseMove}
            onMouseLeave={primaryMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            View My Work
          </motion.a>
          <motion.a
            ref={outlineMagnetic.ref}
            href="#contact"
            className={styles.btnOutline}
            style={{ x: outlineMagnetic.springX, y: outlineMagnetic.springY }}
            onMouseMove={outlineMagnetic.handleMouseMove}
            onMouseLeave={outlineMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            Let&apos;s Talk
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollArrow}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >↓</motion.div>

    </section>
  )
}
```

- [ ] **Step 2: Browser verify Hero renders**

With `npm run dev` running, open `http://localhost:3000`. The hero content should blur-reveal in sequence: name first, then role, then tagline, then buttons. The name letters should spring in while the blur clears.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero/Hero.js
git commit -m "feat: Hero blur-reveal layers timed to light burst — remove cinematic event gating"
```

---

### Task 4: Update Header to use setTimeout instead of cinematic-done event

**Files:**
- Modify: `src/components/Header/Header.js` (lines 23–27)

Replace the `cinematic-done` event listener with a simple `setTimeout`. Desktop: 2800ms (matches burst + content reveal settling). Mobile: 600ms (burst is skipped on mobile so header should appear quickly).

- [ ] **Step 1: Replace the cinematic-done listener in Header.js**

Find this block in `src/components/Header/Header.js`:

```js
  useEffect(() => {
    function onDone() { setReady(true) }
    window.addEventListener('cinematic-done', onDone)
    return () => window.removeEventListener('cinematic-done', onDone)
  }, [])
```

Replace it with:

```js
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    const delay    = isMobile ? 600 : 2800
    const id       = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(id)
  }, [])
```

- [ ] **Step 2: Browser verify header slides in**

Reload `http://localhost:3000`. The header should be invisible during the burst and slide in from the left at ~2.8s.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header/Header.js
git commit -m "feat: Header uses setTimeout for reveal — remove cinematic-done event dependency"
```

---

### Task 5: Wire layout.js and delete orphaned files

**Files:**
- Modify: `src/app/layout.js`
- Delete: `src/components/UI/PageLoader.js`
- Delete: `src/components/UI/CinematicIntro.js`
- Delete: `src/components/UI/CinematicCanvas.js`
- Delete: `src/components/UI/PageReveal.js`
- Delete: `src/__tests__/CinematicIntro.test.js`

- [ ] **Step 1: Rewrite layout.js**

Replace the entire contents of `src/app/layout.js`:

```js
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll   from '../components/UI/SmoothScroll'
import ScrollProgress from '../components/UI/ScrollProgress'
import CustomCursor   from '../components/UI/CustomCursor'
import EasterEgg      from '../components/UI/EasterEgg'
import SpaceCanvas    from '../components/UI/SpaceCanvas'
import LightBurstIntro from '../components/UI/LightBurstIntro'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title      : 'James Keenan — Software Engineer',
  description: 'Full-stack software engineer building modern web applications with clean code and user-focused design.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Ambient background glows */}
        <div className="ambient-glow ambient-glow-cyan"   aria-hidden="true" />
        <div className="ambient-glow ambient-glow-orange" aria-hidden="true" />

        {/* Persistent ambient star field */}
        <SpaceCanvas />

        {/* Light burst intro overlay — self-unmounts after ~1.5s */}
        <LightBurstIntro />

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

- [ ] **Step 2: Delete the orphaned files**

```bash
cd "/Users/james.keenan/Desktop/current projects/Dynamic Portfolio Website/dynamic-portfolio"
rm src/components/UI/PageLoader.js
rm src/components/UI/CinematicIntro.js
rm src/components/UI/CinematicCanvas.js
rm src/components/UI/PageReveal.js
rm src/__tests__/CinematicIntro.test.js
```

- [ ] **Step 3: Verify build has no missing-import errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no module-not-found errors. (Warnings about unused CSS are ok.)

- [ ] **Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass. (CinematicIntro.test.js is gone; LightBurstIntro.test.js, dataShapes, filterProjects, easterEgg, useAnimatedCounter, useTextScramble all pass.)

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.js
git add -u   # stage the deletions
git commit -m "feat: wire LightBurstIntro into layout, delete PageLoader/CinematicIntro/PageReveal"
```

---

### Task 6: Full browser walkthrough and final polish

**Files:**
- Review only — no code changes unless something is off

- [ ] **Step 1: Hard reload and watch the full sequence**

In Chrome, open `http://localhost:3000` and hard reload (`Cmd+Shift+R`). Watch for:

1. **0.0s** — Page loads. Stars twinkling. Hero content is blurred/invisible.
2. **~0.1s** — Bright white-cyan-orange burst expands from center.
3. **~0.4s** — Name starts sharpening out of blur. Letters spring into position simultaneously.
4. **~0.7s** — Role/typewriter text sharpens in.
5. **~1.0s** — Tagline sharpens and rises.
6. **~1.2s** — Buttons sharpen in.
7. **~1.5s** — Burst overlay is gone. Foreground stars begin fading in.
8. **~2.8s** — Header slides in from the left.

- [ ] **Step 2: Test on mobile (DevTools device simulation)**

Open DevTools → toggle device toolbar → choose a mobile device (e.g. iPhone 12). Reload. The burst should be skipped entirely. Hero content should fade in immediately (starting from opacity 0 → the blur animations still run but finish quickly). Header should slide in at ~0.6s.

- [ ] **Step 3: Check scroll behaviour**

Scroll down through the page. Verify:
- Stars continue twinkling in the background
- `StarForeground` (bright stars + asteroids) fades out as you scroll past the hero
- All other sections (About, Skills, Work, Contact) look normal

- [ ] **Step 4: Final commit**

```bash
git add -p   # review any incidental changes
git commit -m "feat: light burst intro complete — burst wave, blur reveal, ambient star field"
```
