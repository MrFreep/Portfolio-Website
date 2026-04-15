# James Keenan Portfolio Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready personal portfolio website for James Keenan with impressive animations, Three.js particle effects, glass morphism design, and full responsiveness across all devices.

**Architecture:** Single Next.js 16 App Router page composing section components vertically. All project/skill content is data-driven via `src/data/`. Framer Motion handles scroll animations and UI transitions. React Three Fiber handles the WebGL particle hero background with bloom post-processing. Lenis provides smooth scroll globally on desktop.

**Tech Stack:** Next.js 16, React 19, Framer Motion, @react-three/fiber, @react-three/drei, @react-three/postprocessing, lenis, @emailjs/browser, react-icons, CSS Modules + Tailwind v4

---

## File Map

```
src/
  app/
    page.js                          REWRITE — composes all sections
    layout.js                        REWRITE — Lenis, CustomCursor, ScrollProgress, metadata
    globals.css                      REWRITE — design tokens, noise, scrollbar, ambient glows
  components/
    Header/
      Header.js                      REWRITE
      header.module.css              REWRITE
    Hero/
      Hero.js                        REWRITE
      hero.module.css                REWRITE
      ParticleField.js               CREATE
    About/
      About.js                       CREATE
      about.module.css               CREATE
    Skills/
      Skills.js                      CREATE
      skills.module.css              CREATE
    Work/
      Work.js                        CREATE (replaces work.js)
      work.module.css                REWRITE
      ProjectRow.js                  CREATE
    Contact/
      Contact.js                     CREATE
      contact.module.css             CREATE
    Footer/
      Footer.js                      CREATE
      footer.module.css              CREATE
    UI/
      CustomCursor.js                CREATE
      PageLoader.js                  CREATE
      ScrollProgress.js              CREATE
      SmoothScroll.js                CREATE
  data/
    projects.js                      CREATE
    skills.js                        CREATE
  hooks/
    useAnimatedCounter.js            CREATE
    useTextScramble.js               CREATE
    useMagneticButton.js             CREATE
  __tests__/
    useAnimatedCounter.test.js       CREATE
    useTextScramble.test.js          CREATE
    filterProjects.test.js           CREATE
    easterEgg.test.js                CREATE
    dataShapes.test.js               CREATE
```

---

## Task 1: Initialize Git and Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Initialize git repo**

```bash
cd "dynamic-portfolio"
git init
echo "node_modules\n.next\n.env.local\n.superpowers" > .gitignore
```

- [ ] **Step 2: Install all new dependencies**

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing lenis @emailjs/browser react-icons
```

- [ ] **Step 3: Install dev dependencies for testing**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-canvas-mock
```

- [ ] **Step 4: Create jest.config.js**

```js
// jest.config.js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
module.exports = createJestConfig({
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
})
```

- [ ] **Step 5: Create jest.setup.js**

```js
// jest.setup.js
import '@testing-library/jest-dom'
import 'jest-canvas-mock'

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => children,
  useFrame: jest.fn(),
  useThree: () => ({ mouse: { x: 0, y: 0 }, camera: {} }),
}))

jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }) => children,
  Bloom: () => null,
}))

jest.mock('lenis', () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
  }))
})
```

- [ ] **Step 6: Add test script to package.json**

Edit `package.json` scripts section:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

- [ ] **Step 7: Verify jest runs with zero tests**

```bash
npm test
```
Expected output: `Test Suites: 0 skipped` or similar — no failures.

- [ ] **Step 8: Create initial commit**

```bash
git add .
git commit -m "chore: initialize repo, install dependencies, configure jest"
```

---

## Task 2: Create Data Files

**Files:**
- Create: `src/data/projects.js`
- Create: `src/data/skills.js`
- Create: `src/__tests__/dataShapes.test.js`

- [ ] **Step 1: Write the failing data shape tests**

```js
// src/__tests__/dataShapes.test.js
import { projects } from '../data/projects'
import { skillCategories } from '../data/skills'

describe('projects data', () => {
  test('is an array', () => {
    expect(Array.isArray(projects)).toBe(true)
  })

  test('each project has required fields', () => {
    projects.forEach(p => {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('title')
      expect(p).toHaveProperty('description')
      expect(p).toHaveProperty('tech')
      expect(p).toHaveProperty('image')
      expect(p).toHaveProperty('githubUrl')
      expect(Array.isArray(p.tech)).toBe(true)
    })
  })
})

describe('skills data', () => {
  test('is an array of categories', () => {
    expect(Array.isArray(skillCategories)).toBe(true)
  })

  test('each category has name and items', () => {
    skillCategories.forEach(cat => {
      expect(cat).toHaveProperty('name')
      expect(cat).toHaveProperty('items')
      expect(Array.isArray(cat.items)).toBe(true)
    })
  })

  test('each skill item has label and optional icon', () => {
    skillCategories.forEach(cat => {
      cat.items.forEach(item => {
        expect(item).toHaveProperty('label')
      })
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test dataShapes
```
Expected: FAIL — `Cannot find module '../data/projects'`

- [ ] **Step 3: Create projects.js**

```js
// src/data/projects.js
export const projects = [
  {
    id: 'project-one',
    title: 'Project One',
    description: 'A full-stack web application built with React and Node.js. Add your real description here.',
    tech: ['React', 'Node', 'MongoDB'],
    image: '/projects/project-one.png',
    video: null,
    liveUrl: null,
    githubUrl: 'https://github.com/yourusername/project-one',
  },
  {
    id: 'project-two',
    title: 'Project Two',
    description: 'A REST API backend with Express and PostgreSQL. Add your real description here.',
    tech: ['Express', 'PostgreSQL', 'Node'],
    image: '/projects/project-two.png',
    video: null,
    liveUrl: null,
    githubUrl: 'https://github.com/yourusername/project-two',
  },
  {
    id: 'project-three',
    title: 'Project Three',
    description: 'A frontend application with React. Add your real description here.',
    tech: ['React', 'CSS', 'JavaScript'],
    image: '/projects/project-three.png',
    video: null,
    liveUrl: null,
    githubUrl: 'https://github.com/yourusername/project-three',
  },
]
```

- [ ] **Step 4: Create skills.js**

```js
// src/data/skills.js
import {
  SiJavascript, SiCss3, SiReact, SiExpress,
  SiMongodb, SiPostgresql, SiJest,
  SiNpm, SiGithub, SiVisualstudiocode, SiPostman,
} from 'react-icons/si'

export const skillCategories = [
  {
    name: 'Languages',
    items: [
      { label: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { label: 'CSS', icon: SiCss3, color: '#1572B6' },
      { label: 'SQL', icon: null, color: null },
    ],
  },
  {
    name: 'Frontend',
    items: [
      { label: 'React', icon: SiReact, color: '#61DAFB' },
    ],
  },
  {
    name: 'Backend',
    items: [
      { label: 'Express', icon: SiExpress, color: '#ffffff' },
      { label: 'REST API', icon: null, color: null },
    ],
  },
  {
    name: 'Databases',
    items: [
      { label: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { label: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
    ],
  },
  {
    name: 'Testing',
    items: [
      { label: 'Jest', icon: SiJest, color: '#C21325' },
      { label: 'SuperTest', icon: null, color: null },
    ],
  },
  {
    name: 'Tools',
    items: [
      { label: 'NPM', icon: SiNpm, color: '#CB3837' },
      { label: 'Mongoose', icon: null, color: null },
      { label: 'GitHub', icon: SiGithub, color: '#ffffff' },
      { label: 'VS Code', icon: SiVisualstudiocode, color: '#007ACC' },
      { label: 'Postman', icon: SiPostman, color: '#FF6C37' },
    ],
  },
]
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test dataShapes
```
Expected: PASS — 4 tests

- [ ] **Step 6: Create placeholder project images in public**

```bash
mkdir -p public/projects
```
Add placeholder `.png` files for each project. Real screenshots go here later.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add projects and skills data files with shape tests"
```

---

## Task 3: Global CSS — Design Tokens, Noise, Scrollbar, Glows

**Files:**
- Rewrite: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css entirely**

```css
/* src/app/globals.css */
@import "tailwindcss";

/* ─── CSS Custom Properties ───────────────────────────── */
:root {
  --bg-base:       #0d0a08;
  --bg-elevated:   #1a1410;
  --surface:       color-mix(in oklab, #3d2d22 50%, transparent);
  --surface-hover: color-mix(in oklab, #4a3828 60%, transparent);
  --border:        rgba(255, 255, 255, 0.08);
  --fg:            #fefcfb;
  --fg-muted:      #c4b5a8;
  --accent-cyan:   #22d3ee;
  --accent-orange: #f97316;

  /* Animation */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ─── Animated gradient property ─────────────────────── */
@property --gradient-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* ─── Base Reset ──────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: auto; /* Lenis handles smooth scroll */
}

body {
  background-color: var(--bg-base);
  color: var(--fg);
  font-family: var(--font-geist-sans), sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ─── Noise Grain Overlay ─────────────────────────────── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}

/* ─── Custom Scrollbar ────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb {
  background: var(--surface-hover);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: var(--accent-cyan); }

/* ─── Ambient Background Glows ───────────────────────── */
.ambient-glow {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  filter: blur(80px);
  animation: drift var(--drift-duration, 25s) ease-in-out infinite;
}

.ambient-glow-cyan {
  width: 700px;
  height: 700px;
  background: rgba(34, 211, 238, 0.06);
  top: -250px;
  left: -250px;
  --drift-duration: 25s;
}

.ambient-glow-orange {
  width: 600px;
  height: 600px;
  background: rgba(249, 115, 22, 0.05);
  bottom: -200px;
  right: -200px;
  --drift-duration: 30s;
  animation-delay: -12s;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(40px, -40px) scale(1.06); }
  66%       { transform: translate(-25px, 25px) scale(0.94); }
}

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ─── Glass Surface Utility ───────────────────────────── */
.glass {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 16px;
}

/* ─── Section Number Utility ──────────────────────────── */
.section-number {
  position: absolute;
  font-size: clamp(80px, 15vw, 160px);
  font-weight: 700;
  color: var(--fg);
  opacity: 0.04;
  top: -0.2em;
  left: -0.1em;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}
```

- [ ] **Step 2: Start dev server and verify dark background**

```bash
npm run dev
```
Open `http://localhost:3000` — background should be near-black `#0d0a08`.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: global design tokens, noise grain, scrollbar, ambient glows"
```

---

## Task 4: Layout — Lenis, Metadata, Ambient Glows

**Files:**
- Create: `src/components/UI/SmoothScroll.js`
- Rewrite: `src/app/layout.js`

- [ ] **Step 1: Create SmoothScroll client component**

```js
// src/components/UI/SmoothScroll.js
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Only enable Lenis on non-touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: Rewrite layout.js**

```js
// src/app/layout.js
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '../components/UI/SmoothScroll'

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

        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify dev server still loads**

```bash
npm run dev
```
Page loads, two ambient glows visible (subtle colored blurs in corners).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Lenis smooth scroll provider and updated layout"
```

---

## Task 5: ScrollProgress Component

**Files:**
- Create: `src/components/UI/ScrollProgress.js`

- [ ] **Step 1: Create ScrollProgress**

```js
// src/components/UI/ScrollProgress.js
'use client'
import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--accent-cyan)',
        transformOrigin: '0%',
        zIndex: 9998,
      }}
    />
  )
}
```

- [ ] **Step 2: Add to layout.js**

In `src/app/layout.js`, import and add inside `<SmoothScroll>`:

```js
import ScrollProgress from '../components/UI/ScrollProgress'

// Inside <body>, above <SmoothScroll>:
<ScrollProgress />
```

- [ ] **Step 3: Verify in browser**

Scroll down the page — a thin cyan line fills from left to right at the very top.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: scroll progress bar"
```

---

## Task 6: Custom Cursor

**Files:**
- Create: `src/components/UI/CustomCursor.js`

- [ ] **Step 1: Create CustomCursor**

```js
// src/components/UI/CustomCursor.js
'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [variant, setVariant] = useState('default') // 'default' | 'link' | 'button'
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 40 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40 })

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    function moveCursor(e) {
      cursorX.set(e.clientX - 8)
      cursorY.set(e.clientY - 8)
    }

    function handleMouseOver(e) {
      if (e.target.closest('a') || e.target.closest('[data-cursor="link"]')) {
        setVariant('link')
      } else if (e.target.closest('button') || e.target.closest('[data-cursor="button"]')) {
        setVariant('button')
      } else {
        setVariant('default')
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [cursorX, cursorY])

  const variants = {
    default: { width: 16, height: 16, backgroundColor: 'var(--accent-cyan)', opacity: 0.8 },
    link:    { width: 32, height: 32, backgroundColor: 'transparent', border: '2px solid var(--accent-cyan)', opacity: 1 },
    button:  { width: 12, height: 12, backgroundColor: 'var(--accent-orange)', opacity: 1 },
  }

  return (
    <motion.div
      animate={variant}
      variants={variants}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 10000,
        mixBlendMode: 'difference',
      }}
    />
  )
}
```

- [ ] **Step 2: Add to layout.js**

```js
import CustomCursor from '../components/UI/CustomCursor'

// Inside <body>, before <SmoothScroll>:
<CustomCursor />
```

- [ ] **Step 3: Hide default cursor on desktop via globals.css**

Add to `globals.css`:
```css
@media (pointer: fine) {
  * { cursor: none !important; }
}
```

- [ ] **Step 4: Verify in browser**

Move mouse — custom cyan dot follows with smooth lag. Hovering links shows ring, buttons show orange dot.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: custom cursor with link/button variants"
```

---

## Task 7: useAnimatedCounter Hook

**Files:**
- Create: `src/hooks/useAnimatedCounter.js`
- Create: `src/__tests__/useAnimatedCounter.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/__tests__/useAnimatedCounter.test.js
import { renderHook, act } from '@testing-library/react'
import useAnimatedCounter from '../hooks/useAnimatedCounter'

describe('useAnimatedCounter', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('starts at 0', () => {
    const { result } = renderHook(() => useAnimatedCounter(100))
    expect(result.current.count).toBe(0)
  })

  test('does not animate before start() is called', () => {
    const { result } = renderHook(() => useAnimatedCounter(100))
    act(() => jest.advanceTimersByTime(500))
    expect(result.current.count).toBe(0)
  })

  test('reaches target after animation completes', () => {
    const { result } = renderHook(() => useAnimatedCounter(100, 500))
    act(() => { result.current.start() })
    act(() => jest.advanceTimersByTime(600))
    expect(result.current.count).toBe(100)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test useAnimatedCounter
```
Expected: FAIL — `Cannot find module '../hooks/useAnimatedCounter'`

- [ ] **Step 3: Implement the hook**

```js
// src/hooks/useAnimatedCounter.js
import { useState, useEffect, useRef } from 'react'

export default function useAnimatedCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()

    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, target, duration])

  return { count, start: () => setStarted(true) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test useAnimatedCounter
```
Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: useAnimatedCounter hook with TDD"
```

---

## Task 8: useTextScramble Hook

**Files:**
- Create: `src/hooks/useTextScramble.js`
- Create: `src/__tests__/useTextScramble.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/__tests__/useTextScramble.test.js
import { renderHook, act } from '@testing-library/react'
import useTextScramble from '../hooks/useTextScramble'

describe('useTextScramble', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('returns original text before trigger', () => {
    const { result } = renderHook(() => useTextScramble('Hello', false))
    expect(result.current).toBe('Hello')
  })

  test('returns scrambled text immediately after trigger', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTextScramble('Hello', trigger),
      { initialProps: { trigger: false } }
    )
    act(() => { rerender({ trigger: true }) })
    act(() => jest.advanceTimersByTime(50))
    // Text should be changing — length stays same
    expect(result.current.length).toBe('Hello'.length)
  })

  test('resolves to original text after animation completes', () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useTextScramble('Hi', trigger),
      { initialProps: { trigger: false } }
    )
    act(() => { rerender({ trigger: true }) })
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current).toBe('Hi')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test useTextScramble
```
Expected: FAIL

- [ ] **Step 3: Implement the hook**

```js
// src/hooks/useTextScramble.js
import { useState, useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export default function useTextScramble(text, trigger) {
  const [displayText, setDisplayText] = useState(text)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text)
      return
    }

    let iteration = 0
    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < iteration) return text[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      iteration += 0.4
      if (iteration >= text.length) {
        clearInterval(intervalRef.current)
        setDisplayText(text)
      }
    }, 30)

    return () => clearInterval(intervalRef.current)
  }, [trigger, text])

  return displayText
}
```

- [ ] **Step 4: Run tests**

```bash
npm test useTextScramble
```
Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: useTextScramble hook with TDD"
```

---

## Task 9: useMagneticButton Hook

**Files:**
- Create: `src/hooks/useMagneticButton.js`

- [ ] **Step 1: Implement the hook**

No complex logic to unit test — this is a pure DOM interaction hook. It returns motion values that Framer Motion consumes.

```js
// src/hooks/useMagneticButton.js
'use client'
import { useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

export default function useMagneticButton(strength = 0.35) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  function handleMouseMove(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return { ref, springX, springY, handleMouseMove, handleMouseLeave }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useMagneticButton.js
git commit -m "feat: useMagneticButton hook"
```

---

## Task 10: PageLoader Animation

**Files:**
- Create: `src/components/UI/PageLoader.js`

- [ ] **Step 1: Create PageLoader**

```js
// src/components/UI/PageLoader.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setDone(true)
            onComplete?.()
          }, 400)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 80)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
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
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-orange))',
                width: `${Math.min(progress, 100)}%`,
                boxShadow: '0 0 8px var(--accent-cyan)',
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Add to layout.js**

```js
import PageLoader from '../components/UI/PageLoader'

// Inside <body> before <SmoothScroll>:
<PageLoader />
```

- [ ] **Step 3: Verify in browser**

Refresh `http://localhost:3000` — dark screen with spinning ring and progress bar appears, then fades out revealing the page.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: page load animation with progress bar"
```

---

## Task 11: Header

**Files:**
- Rewrite: `src/components/Header/Header.js`
- Rewrite: `src/components/Header/header.module.css`

- [ ] **Step 1: Write header.module.css**

```css
/* src/components/Header/header.module.css */

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 72px;
  transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
  border-bottom: 1px solid transparent;
}

.header.scrolled {
  background: color-mix(in oklab, #3d2d22 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--border);
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  text-decoration: none;
  letter-spacing: -0.02em;
  z-index: 1;
}

.logo span {
  color: var(--accent-cyan);
}

.nav {
  display: flex;
  gap: 40px;
}

.navLink {
  color: var(--fg-muted);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.navLink::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent-cyan);
  transition: width 0.3s var(--ease-spring);
}

.navLink:hover,
.navLink.active {
  color: var(--fg);
}

.navLink:hover::after,
.navLink.active::after {
  width: 100%;
}

.resumeBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-cyan);
  color: #0d0a08;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: box-shadow 0.2s ease;
}

.resumeBtn:hover {
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 8px;
  z-index: 200;
}

.hamburgerLine {
  width: 24px;
  height: 2px;
  background: var(--fg);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: block;
}

.hamburger.open .hamburgerLine:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.open .hamburgerLine:nth-child(2) {
  opacity: 0;
}
.hamburger.open .hamburgerLine:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile overlay menu */
.mobileMenu {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--bg-base);
  z-index: 150;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.mobileMenu.open {
  display: flex;
}

.mobileNavLink {
  color: var(--fg);
  text-decoration: none;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.2s ease;
}

.mobileNavLink:hover {
  color: var(--accent-cyan);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 24px;
  }
  .nav,
  .resumeBtn {
    display: none;
  }
  .hamburger {
    display: flex;
  }
}
```

- [ ] **Step 2: Write Header.js**

```js
// src/components/Header/Header.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './header.module.css'

const NAV_LINKS = [
  { label: 'Home',    href: '#home' },
  { label: 'About',   href: '#about' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Work',    href: '#work' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const resumeMagnetic = useMagneticButton(0.3)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section via Intersection Observer
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { threshold: 0.5 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <a href="#home" className={styles.logo}>
          James <span>Keenan</span>
        </a>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${activeSection === link.href.slice(1) ? styles.active : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <motion.a
          ref={resumeMagnetic.ref}
          href="/resume.pdf"
          download
          className={styles.resumeBtn}
          style={{ x: resumeMagnetic.springX, y: resumeMagnetic.springY }}
          onMouseMove={resumeMagnetic.handleMouseMove}
          onMouseLeave={resumeMagnetic.handleMouseLeave}
          data-cursor="button"
        >
          Resume ↓
        </motion.a>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={handleNavClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="/resume.pdf"
              download
              className={styles.resumeBtn}
              onClick={handleNavClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Download Resume
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 3: Add Header to page.js**

```js
// src/app/page.js
import Header from '../components/Header/Header'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        {/* sections added here as they are built */}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Desktop: logo left, nav center, resume button right. Scroll down — header gains glass background. Mobile (resize to <768px): nav hidden, hamburger shows, tap opens full-screen menu.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: header with glass scroll, active nav, mobile menu"
```

---

## Task 12: ParticleField — Three.js Hero Background

**Files:**
- Create: `src/components/Hero/ParticleField.js`

- [ ] **Step 1: Create ParticleField component**

```js
// src/components/Hero/ParticleField.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function Particles({ count }) {
  const mesh = useRef()
  const { mouse } = useThree()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const cyanColor = new THREE.Color('#22d3ee')
    const orangeColor = new THREE.Color('#f97316')

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10

      const mixFactor = Math.random()
      const color = cyanColor.clone().lerp(orangeColor, mixFactor * 0.3)
      col[i * 3]     = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return [pos, col]
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.y = t * 0.02 + mouse.x * 0.05
    mesh.current.rotation.x = t * 0.01 + mouse.y * 0.03
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}

export default function ParticleField() {
  // Reduce particle count on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const count = isMobile ? 600 : 2000

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 75 }}
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <Particles count={count} />
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          height={300}
        />
      </EffectComposer>
    </Canvas>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero/ParticleField.js
git commit -m "feat: Three.js particle field with bloom post-processing"
```

---

## Task 13: Hero Section

**Files:**
- Rewrite: `src/components/Hero/Hero.js`
- Rewrite: `src/components/Hero/hero.module.css`

- [ ] **Step 1: Write hero.module.css**

```css
/* src/components/Hero/hero.module.css */

.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
}

.canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.spotlight {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transition: background 0.1s ease;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}

.name {
  font-size: clamp(52px, 8vw, 96px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(
    var(--gradient-angle),
    var(--accent-cyan),
    var(--accent-orange),
    var(--fg),
    var(--accent-cyan)
  );
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gradientFlow 6s linear infinite;
}

@keyframes gradientFlow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.typewriterWrapper {
  font-size: clamp(18px, 3vw, 26px);
  font-weight: 400;
  color: var(--fg-muted);
  height: 36px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--accent-cyan);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.tagline {
  font-size: clamp(15px, 2vw, 18px);
  color: var(--fg-muted);
  max-width: 500px;
  line-height: 1.6;
  margin-top: 8px;
}

.buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-cyan);
  color: #0d0a08;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: box-shadow 0.2s ease;
}

.btnPrimary:hover {
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
}

.btnOutline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--fg);
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--border);
  transition: border-color 0.2s ease, color 0.2s ease;
}

.btnOutline:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.scrollArrow {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: var(--fg-muted);
  font-size: 24px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(8px); }
}

@media (max-width: 480px) {
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  .btnPrimary,
  .btnOutline {
    width: 200px;
    justify-content: center;
  }
}
```

- [ ] **Step 2: Write Hero.js**

```js
// src/components/Hero/Hero.js
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import useMagneticButton from '../../hooks/useMagneticButton'
import styles from './hero.module.css'

// Dynamically import Three.js to avoid SSR issues
const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false })

const ROLES = ['Software Engineer', 'Full-Stack Developer', 'Problem Solver']

function useTypewriter(words, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const currentWord = words[wordIndex % words.length]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = currentWord.slice(0, displayText.length + 1)
        setDisplayText(next)
        if (next === currentWord) {
          setIsPaused(true)
          setTimeout(() => {
            setIsPaused(false)
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        const next = currentWord.slice(0, displayText.length - 1)
        setDisplayText(next)
        if (next === '') {
          setIsDeleting(false)
          setWordIndex(i => i + 1)
        }
      }
    }, isDeleting ? deleteSpeed : speed)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime])

  return displayText
}

// Split name into individual animated letters
function AnimatedName({ name }) {
  const letters = name.split('')
  return (
    <h1 className={styles.name} aria-label={name}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8 + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
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
  const typewriterText = useTypewriter(ROLES)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const primaryMagnetic = useMagneticButton(0.3)
  const outlineMagnetic = useMagneticButton(0.3)

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSpotlight({ x, y })
  }

  return (
    <section
      id="home"
      className={styles.hero}
      onMouseMove={handleMouseMove}
    >
      {/* Three.js particle background */}
      <div className={styles.canvas}>
        <ParticleField />
      </div>

      {/* Spotlight effect */}
      <div
        className={styles.spotlight}
        style={{
          background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(34, 211, 238, 0.07), transparent 50%)`,
        }}
      />

      {/* Hero content */}
      <div className={styles.content}>
        <AnimatedName name="James Keenan" />

        <motion.div
          className={styles.typewriterWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span>{typewriterText}</span>
          <span className={styles.cursor} aria-hidden="true" />
        </motion.div>

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Building modern web experiences with clean code and purposeful design.
        </motion.p>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
      <div className={styles.scrollArrow} aria-hidden="true">↓</div>
    </section>
  )
}
```

- [ ] **Step 3: Add Hero to page.js**

```js
// src/app/page.js
import Header from '../components/Header/Header'
import Hero from '../components/Hero/Hero'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

- Name letters animate in one by one with spring physics
- Typewriter cycles through roles below
- Glowing particles drift in background
- Spotlight follows cursor
- CTA buttons have magnetic pull

- [ ] **Step 5 (Optional): Add scroll parallax to particle field**

In `Hero.js`, wrap the canvas div with a `motion.div` that moves at 0.3x scroll speed (desktop only):

```js
import { useScroll, useTransform } from 'framer-motion'

// Inside Hero component:
const { scrollY } = useScroll()
const canvasY = useTransform(scrollY, [0, 800], [0, -240])
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// Replace <div className={styles.canvas}> with:
<motion.div
  className={styles.canvas}
  style={{ y: isTouch ? 0 : canvasY }}
>
  <ParticleField />
</motion.div>
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Hero section with Three.js particles, typewriter, split-char animation"
```

---

## Task 14: About Section

**Files:**
- Create: `src/components/About/About.js`
- Create: `src/components/About/about.module.css`

- [ ] **Step 1: Write about.module.css**

```css
/* src/components/About/about.module.css */

.about {
  position: relative;
  padding: 120px 48px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.heading {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}

.bio p {
  color: var(--fg-muted);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.bio p:last-child {
  margin-bottom: 0;
}

.currentlyCard {
  margin-top: 32px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.currentlyDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan);
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.3); opacity: 0.7; }
}

.currentlyText {
  font-size: 14px;
  color: var(--fg-muted);
}

.currentlyText strong {
  color: var(--fg);
  font-weight: 600;
}

.photoWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo {
  width: 320px;
  height: 380px;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

/* Counters */
.counters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 64px;
  position: relative;
  z-index: 1;
}

.counter {
  padding: 28px 20px;
  text-align: center;
}

.counterNumber {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: var(--accent-cyan);
  line-height: 1;
  display: block;
}

.counterLabel {
  font-size: 13px;
  color: var(--fg-muted);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Responsive */
@media (max-width: 1024px) {
  .inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .photoWrapper {
    order: -1;
  }
  .photo {
    width: 240px;
    height: 280px;
  }
  .counters {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .about {
    padding: 80px 24px;
  }
  .counters {
    grid-template-columns: 1fr 1fr;
  }
  .counter:last-child {
    grid-column: 1 / -1;
  }
}
```

- [ ] **Step 2: Write About.js**

```js
// src/components/About/About.js
'use client'
import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import useAnimatedCounter from '../../hooks/useAnimatedCounter'
import useTextScramble from '../../hooks/useTextScramble'
import styles from './about.module.css'

const COUNTERS = [
  { target: 3,  suffix: '+', label: 'Projects Built' },
  { target: 15, suffix: '+', label: 'Technologies' },
  { target: 1,  suffix: '+', label: 'Years Experience' },
]

function CounterItem({ target, suffix, label }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { count, start } = useAnimatedCounter(target, 1500)

  useEffect(() => {
    if (isInView) start()
  }, [isInView]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      ref={ref}
      className={`${styles.counter} glass`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className={styles.counterNumber}>{count}{suffix}</span>
      <span className={styles.counterLabel}>{label}</span>
    </motion.div>
  )
}

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-200px' })
  const headingText = useTextScramble('About Me', isInView)

  return (
    <section id="about" className={styles.about} ref={ref}>
      <span className="section-number" aria-hidden="true">01</span>

      <div className={styles.inner}>
        <motion.div
          className={styles.bio}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-150px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.heading}>{headingText}</h2>

          {/* REPLACE with your real bio */}
          <p>
            I&apos;m a full-stack software engineer passionate about building things that live on the internet.
            I care about writing clean, maintainable code and creating experiences that actually feel good to use.
          </p>
          <p>
            My background spans the full web stack — from crafting responsive UIs in React to building
            RESTful APIs with Express and working with both SQL and NoSQL databases. I enjoy the entire process,
            from designing a system to shipping the final product.
          </p>
          <p>
            When I&apos;m not coding, [add something personal here — hobbies, interests, what drives you].
          </p>

          <div className={`${styles.currentlyCard} glass`}>
            <span className={styles.currentlyDot} />
            <p className={styles.currentlyText}>
              <strong>Currently:</strong> Building this portfolio and sharpening my skills in Three.js and animation.
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.photoWrapper}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-150px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <Image
            src="/Profile.jpg"
            alt="James Keenan"
            width={320}
            height={380}
            className={styles.photo}
            priority={false}
          />
        </motion.div>
      </div>

      {/* Animated counters */}
      <div className={styles.counters}>
        {COUNTERS.map(c => (
          <CounterItem key={c.label} {...c} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add About to page.js**

```js
import About from '../components/About/About'
// Add <About /> inside <main> after <Hero />
```

- [ ] **Step 4: Verify in browser**

Scroll to About — bio and photo slide in from opposite sides, heading scrambles then resolves, counters count up, "Currently" card glows with pulsing dot.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: About section with animated counters and scramble heading"
```

---

## Task 15: Skills Section

**Files:**
- Create: `src/components/Skills/Skills.js`
- Create: `src/components/Skills/skills.module.css`

- [ ] **Step 1: Write skills.module.css**

```css
/* src/components/Skills/skills.module.css */

.skills {
  position: relative;
  padding: 120px 48px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.heading {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 64px;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 48px;
  position: relative;
  z-index: 1;
}

.category {}

.categoryName {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-cyan);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 20px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Skill with icon */
.skillItem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-muted);
  transition: color 0.2s ease, box-shadow 0.2s ease;
}

.skillItem:hover {
  color: var(--fg);
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.15);
}

.skillIcon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Text badge (no logo) */
.skillBadge {
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  transition: color 0.2s ease;
}

.skillBadge:hover {
  color: var(--fg);
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  color: var(--fg);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid var(--border);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.skillItem:hover .tooltip {
  opacity: 1;
}

@media (max-width: 480px) {
  .skills {
    padding: 80px 24px;
  }
}
```

- [ ] **Step 2: Write Skills.js**

```js
// src/components/Skills/Skills.js
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useTextScramble from '../../hooks/useTextScramble'
import { skillCategories } from '../../data/skills'
import styles from './skills.module.css'

function SkillItem({ item, index }) {
  const Icon = item.icon

  if (Icon) {
    return (
      <motion.div
        className={`${styles.skillItem} glass`}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.4,
          delay: index * 0.06,
          ease: [0.16, 1, 0.3, 1],
        }}
        data-cursor="link"
      >
        <Icon
          className={styles.skillIcon}
          style={{ color: item.color || 'var(--fg-muted)' }}
          aria-hidden="true"
        />
        <span>{item.label}</span>
        <span className={styles.tooltip}>{item.label}</span>
      </motion.div>
    )
  }

  // Text badge for items without logos
  return (
    <motion.span
      className={styles.skillBadge}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {item.label}
    </motion.span>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-200px' })
  const headingText = useTextScramble('Skills', isInView)

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <span className="section-number" aria-hidden="true">02</span>

      <h2 className={styles.heading}>{headingText}</h2>

      <div className={styles.categories}>
        {skillCategories.map((category, catIndex) => (
          <div key={category.name} className={styles.category}>
            <motion.h3
              className={styles.categoryName}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.05 }}
            >
              {category.name}
            </motion.h3>
            <div className={styles.items}>
              {category.items.map((item, i) => (
                <SkillItem key={item.label} item={item} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add to page.js**

```js
import Skills from '../components/Skills/Skills'
// Add <Skills /> after <About />
```

- [ ] **Step 4: Verify in browser**

Scroll to Skills — heading scrambles, category labels appear, skill icons and badges stagger in. Hovering icons shows tooltip.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Skills section with icon grid, tooltips, stagger animation"
```

---

## Task 16: ProjectRow Component

**Files:**
- Create: `src/components/Work/ProjectRow.js`

- [ ] **Step 1: Create ProjectRow.js**

```js
// src/components/Work/ProjectRow.js
'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from './work.module.css'

export default function ProjectRow({ project, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const isEven = index % 2 === 0

  function handleMouseMove(e) {
    // Disable tilt on touch
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15
    setTilt({ x, y })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      className={`${styles.projectRow} ${isEven ? styles.rowEven : styles.rowOdd}`}
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image side */}
      <motion.div
        ref={imgRef}
        className={styles.imageWrapper}
        style={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={`${styles.imageCard} glass`}>
          <Image
            src={isHovered && project.video ? project.video : project.image}
            alt={project.title}
            width={600}
            height={400}
            className={styles.projectImage}
          />
          {project.video && (
            <div className={styles.previewHint}>
              {isHovered ? 'Live Preview' : 'Hover to Preview'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content side */}
      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.techTags}>
          {project.tech.map(tag => (
            <span key={tag} className={styles.techTag}>{tag}</span>
          ))}
        </div>

        <div className={styles.projectLinks}>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
              data-cursor="link"
            >
              Live Demo ↗
            </a>
          )}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.linkBtn} ${styles.linkBtnOutline}`}
            data-cursor="link"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Work/ProjectRow.js
git commit -m "feat: ProjectRow with 3D tilt and video preview"
```

---

## Task 17: Work Section with Filter

**Files:**
- Create: `src/components/Work/Work.js`
- Rewrite: `src/components/Work/work.module.css`
- Create: `src/__tests__/filterProjects.test.js`

- [ ] **Step 1: Write filter function test**

```js
// src/__tests__/filterProjects.test.js
import { filterProjects } from '../components/Work/Work'

const mockProjects = [
  { id: '1', tech: ['React', 'Node'] },
  { id: '2', tech: ['Express', 'MongoDB'] },
  { id: '3', tech: ['React', 'PostgreSQL'] },
]

describe('filterProjects', () => {
  test('returns all projects for "All" filter', () => {
    expect(filterProjects(mockProjects, 'All')).toHaveLength(3)
  })

  test('filters by tech tag', () => {
    expect(filterProjects(mockProjects, 'React')).toHaveLength(2)
  })

  test('returns empty array when no match', () => {
    expect(filterProjects(mockProjects, 'Python')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test filterProjects
```
Expected: FAIL

- [ ] **Step 3: Write work.module.css**

```css
/* src/components/Work/work.module.css */

.work {
  position: relative;
  padding: 120px 48px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.heading {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 40px;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

/* Filter tags */
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 64px;
  position: relative;
  z-index: 1;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filterBtn {
  padding: 8px 20px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--fg-muted);
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.filterBtn:hover {
  color: var(--fg);
  border-color: var(--accent-cyan);
}

.filterBtn.active {
  background: var(--accent-cyan);
  color: #0d0a08;
  border-color: var(--accent-cyan);
  font-weight: 600;
}

/* Project rows */
.projects {
  display: flex;
  flex-direction: column;
  gap: 80px;
  position: relative;
  z-index: 1;
}

.projectRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.rowOdd {
  direction: rtl;
}

.rowOdd > * {
  direction: ltr;
}

.imageWrapper {
  cursor: default;
}

.imageCard {
  overflow: hidden;
  position: relative;
}

.projectImage {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s ease;
}

.imageCard:hover .projectImage {
  transform: scale(1.03);
}

.previewHint {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 11px;
  color: var(--fg-muted);
  background: rgba(13, 10, 8, 0.8);
  padding: 4px 10px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
}

.projectContent {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.projectTitle {
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.02em;
}

.projectDescription {
  color: var(--fg-muted);
  font-size: 15px;
  line-height: 1.7;
}

.techTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.techTag {
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-orange);
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.projectLinks {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.linkBtn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  background: var(--accent-cyan);
  color: #0d0a08;
  transition: box-shadow 0.2s ease;
}

.linkBtn:hover {
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
}

.linkBtnOutline {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
}

.linkBtnOutline:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: none;
}

.empty {
  text-align: center;
  color: var(--fg-muted);
  padding: 60px 0;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .projectRow {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .rowOdd {
    direction: ltr;
  }
}

@media (max-width: 480px) {
  .work {
    padding: 80px 24px;
  }
  .projectLinks {
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Write Work.js with exported filterProjects**

```js
// src/components/Work/Work.js
'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import useTextScramble from '../../hooks/useTextScramble'
import { useInView } from 'framer-motion'
import { projects } from '../../data/projects'
import ProjectRow from './ProjectRow'
import styles from './work.module.css'

// Exported so it can be unit tested
export function filterProjects(projectList, activeFilter) {
  if (activeFilter === 'All') return projectList
  return projectList.filter(p => p.tech.includes(activeFilter))
}

// Derive unique filter tags from all projects
function getFilterTags(projectList) {
  const tags = new Set(['All'])
  projectList.forEach(p => p.tech.forEach(t => tags.add(t)))
  return Array.from(tags)
}

export default function Work() {
  const [activeFilter, setActiveFilter] = useState('All')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-200px' })
  const headingText = useTextScramble('My Work', isInView)

  const filterTags = getFilterTags(projects)
  const filtered = filterProjects(projects, activeFilter)

  return (
    <section id="work" className={styles.work} ref={ref}>
      <span className="section-number" aria-hidden="true">03</span>

      <h2 className={styles.heading}>{headingText}</h2>

      {/* Filter tags */}
      <div className={styles.filters} role="group" aria-label="Filter projects by technology">
        {filterTags.map(tag => (
          <button
            key={tag}
            className={`${styles.filterBtn} ${activeFilter === tag ? styles.active : ''}`}
            onClick={() => setActiveFilter(tag)}
            aria-pressed={activeFilter === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Projects with layout animation */}
      <LayoutGroup>
        <motion.div className={styles.projects} layout>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No projects match this filter yet.
              </motion.p>
            ) : (
              filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectRow project={project} index={i} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  )
}
```

- [ ] **Step 5: Run filter tests**

```bash
npm test filterProjects
```
Expected: PASS — 3 tests

- [ ] **Step 6: Add Work to page.js**

```js
import Work from '../components/Work/Work'
// Add <Work /> after <Skills />
```

- [ ] **Step 7: Verify in browser**

Projects display in alternating rows. Filter buttons appear at top — clicking a tag smoothly filters cards with layout animation.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: Work section with filter, layout animations, ProjectRow"
```

---

## Task 18: Contact Section

**Files:**
- Create: `src/components/Contact/Contact.js`
- Create: `src/components/Contact/contact.module.css`

**Pre-requisite:** Set up EmailJS before implementing:
1. Create account at [emailjs.com](https://www.emailjs.com)
2. Connect a Gmail service → note the **Service ID**
3. Create an email template with variables `{{from_name}}`, `{{from_email}}`, `{{message}}` → note the **Template ID**
4. Copy your **Public Key** from Account settings
5. Create `.env.local` in project root:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

- [ ] **Step 1: Write contact.module.css**

```css
/* src/components/Contact/contact.module.css */

.contact {
  position: relative;
  padding: 120px 48px;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.heading {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.subheading {
  color: var(--fg-muted);
  font-size: 16px;
  margin-bottom: 56px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.input,
.textarea {
  width: 100%;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--fg);
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);
  outline: none;
}

.input:focus,
.textarea:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
}

.input::placeholder,
.textarea::placeholder {
  color: rgba(196, 181, 168, 0.4);
}

.textarea {
  min-height: 160px;
  resize: vertical;
}

.submitBtn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-cyan);
  color: #0d0a08;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s ease, opacity 0.2s ease;
}

.submitBtn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.feedbackSuccess {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.feedbackError {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.divider {
  margin: 48px 0;
  border: none;
  border-top: 1px solid var(--border);
  position: relative;
  z-index: 1;
}

.emailRow {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
}

.emailAddress {
  color: var(--fg-muted);
  font-size: 15px;
}

.copyBtn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--fg-muted);
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.copyBtn:hover {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.socialLinks {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  position: relative;
  z-index: 1;
}

.socialLink {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.socialLink:hover {
  color: var(--accent-cyan);
}

.socialIcon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .contact {
    padding: 80px 24px;
  }
  .submitBtn {
    width: 100%;
    justify-content: center;
  }
}
```

- [ ] **Step 2: Write Contact.js**

```js
// src/components/Contact/Contact.js
'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { SiGithub, SiLinkedin } from 'react-icons/si'
import useTextScramble from '../../hooks/useTextScramble'
import useMagneticButton from '../../hooks/useMagneticButton'
import { useInView } from 'framer-motion'
import styles from './contact.module.css'

const YOUR_EMAIL = 'your.email@gmail.com'    // REPLACE with your real email
const YOUR_GITHUB = 'https://github.com/yourusername'  // REPLACE
const YOUR_LINKEDIN = 'https://linkedin.com/in/yourusername' // REPLACE

export default function Contact() {
  const formRef = useRef(null)
  const sectionRef = useRef(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const [copyLabel, setCopyLabel] = useState('Copy')
  const isInView = useInView(sectionRef, { once: true, margin: '-200px' })
  const headingText = useTextScramble("Let's Talk", isInView)
  const submitMagnetic = useMagneticButton(0.2)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
      formRef.current.reset()
    } catch {
      setStatus('error')
    }
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText(YOUR_EMAIL)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  return (
    <section id="contact" className={styles.contact} ref={sectionRef}>
      <span className="section-number" aria-hidden="true">04</span>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-150px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className={styles.heading}>{headingText}</h2>
        <p className={styles.subheading}>
          Have a project in mind or want to work together?<br />
          Send me a message and I&apos;ll get back to you.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="from_name" className={styles.label}>Name</label>
            <input
              id="from_name"
              name="from_name"
              type="text"
              className={styles.input}
              placeholder="Your name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="from_email" className={styles.label}>Email</label>
            <input
              id="from_email"
              name="from_email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Message</label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              placeholder="Tell me about your project..."
              required
            />
          </div>

          {status === 'success' && (
            <p className={`${styles.feedback} ${styles.feedbackSuccess}`}>
              Message sent! I&apos;ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className={`${styles.feedback} ${styles.feedbackError}`}>
              Something went wrong. Please try again or email me directly.
            </p>
          )}

          <motion.button
            ref={submitMagnetic.ref}
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'sending'}
            style={{ x: submitMagnetic.springX, y: submitMagnetic.springY }}
            onMouseMove={submitMagnetic.handleMouseMove}
            onMouseLeave={submitMagnetic.handleMouseLeave}
            data-cursor="button"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message →'}
          </motion.button>
        </form>

        <hr className={styles.divider} />

        <div className={styles.emailRow}>
          <span className={styles.emailAddress}>{YOUR_EMAIL}</span>
          <button
            className={styles.copyBtn}
            onClick={handleCopyEmail}
            type="button"
          >
            {copyLabel}
          </button>
        </div>

        <div className={styles.socialLinks}>
          <a
            href={YOUR_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            data-cursor="link"
          >
            <SiGithub className={styles.socialIcon} aria-hidden="true" />
            GitHub
          </a>
          <a
            href={YOUR_LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            data-cursor="link"
          >
            <SiLinkedin className={styles.socialIcon} aria-hidden="true" />
            LinkedIn
          </a>
        </div>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 3: Add Contact to page.js**

```js
import Contact from '../components/Contact/Contact'
// Add <Contact /> after <Work />
```

- [ ] **Step 4: Fill in your real content**

In `Contact.js`, replace:
- `YOUR_EMAIL` with your real email address
- `YOUR_GITHUB` with your GitHub profile URL
- `YOUR_LINKEDIN` with your LinkedIn profile URL

- [ ] **Step 5: Verify form in browser**

Fill in the form and submit. Check your Gmail inbox for the test message.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Contact section with EmailJS form and social links"
```

---

## Task 19: Footer

**Files:**
- Create: `src/components/Footer/Footer.js`
- Create: `src/components/Footer/footer.module.css`

- [ ] **Step 1: Write footer.module.css**

```css
/* src/components/Footer/footer.module.css */

.footer {
  border-top: 1px solid var(--border);
  padding: 32px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg-muted);
}

.copy {
  font-size: 13px;
  color: var(--fg-muted);
  opacity: 0.6;
}

.socials {
  display: flex;
  gap: 20px;
}

.socialIcon {
  color: var(--fg-muted);
  font-size: 20px;
  transition: color 0.2s ease;
}

.socialIcon:hover {
  color: var(--accent-cyan);
}

@media (max-width: 480px) {
  .footer {
    padding: 24px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
```

- [ ] **Step 2: Write Footer.js**

```js
// src/components/Footer/Footer.js
import { SiGithub, SiLinkedin } from 'react-icons/si'
import styles from './footer.module.css'

const YOUR_GITHUB = 'https://github.com/yourusername'    // REPLACE
const YOUR_LINKEDIN = 'https://linkedin.com/in/yourusername' // REPLACE

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.name}>James Keenan</span>
      <span className={styles.copy}>© {new Date().getFullYear()} James Keenan</span>
      <div className={styles.socials}>
        <a href={YOUR_GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-cursor="link">
          <SiGithub className={styles.socialIcon} />
        </a>
        <a href={YOUR_LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cursor="link">
          <SiLinkedin className={styles.socialIcon} />
        </a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Add Footer to page.js**

```js
import Footer from '../components/Footer/Footer'
// Add <Footer /> after </main>, inside the outer <div>
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Footer with social links"
```

---

## Task 20: Easter Egg

**Files:**
- Create: `src/components/UI/EasterEgg.js`
- Create: `src/__tests__/easterEgg.test.js`

- [ ] **Step 1: Write the failing test for sequence detection**

```js
// src/__tests__/easterEgg.test.js
import { detectSequence } from '../components/UI/EasterEgg'

describe('detectSequence', () => {
  test('returns false when sequence is incomplete', () => {
    expect(detectSequence('hir', 'hire')).toBe(false)
  })

  test('returns true when sequence matches', () => {
    expect(detectSequence('hire', 'hire')).toBe(true)
  })

  test('returns false for wrong sequence', () => {
    expect(detectSequence('fire', 'hire')).toBe(false)
  })

  test('works with recent keystrokes (trailing match)', () => {
    expect(detectSequence('xxxxxhire', 'hire')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test easterEgg
```
Expected: FAIL

- [ ] **Step 3: Create EasterEgg.js**

```js
// src/components/UI/EasterEgg.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECRET = 'hire'

// Exported for unit testing
export function detectSequence(typed, secret) {
  return typed.slice(-secret.length) === secret
}

export default function EasterEgg() {
  const [triggered, setTriggered] = useState(false)
  const [typed, setTyped] = useState('')
  const [tapCount, setTapCount] = useState(0)

  // Keyboard trigger
  useEffect(() => {
    function handleKeydown(e) {
      if (e.key.length !== 1) return
      const next = (typed + e.key).slice(-SECRET.length * 2)
      setTyped(next)
      if (detectSequence(next, SECRET)) {
        setTriggered(true)
        setTyped('')
        setTimeout(() => setTriggered(false), 3000)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [typed])

  // Mobile: tap header logo 5 times
  const handleLogoTap = useCallback(() => {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) {
      setTapCount(0)
      setTriggered(true)
      setTimeout(() => setTriggered(false), 3000)
    }
    setTimeout(() => setTapCount(0), 2000)
  }, [tapCount])

  // Expose tap handler via custom event so Header can call it
  useEffect(() => {
    window.addEventListener('logo-tap', handleLogoTap)
    return () => window.removeEventListener('logo-tap', handleLogoTap)
  }, [handleLogoTap])

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              padding: '40px 64px',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(34, 211, 238, 0.3)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--fg)',
              marginBottom: 8,
            }}>
              You found it!
            </p>
            <p style={{ fontSize: 16, color: 'var(--accent-cyan)' }}>
              Let&apos;s work together
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Add logo tap dispatch to Header.js**

In `src/components/Header/Header.js`, update the logo `<a>` to dispatch the custom event:

```js
<a
  href="#home"
  className={styles.logo}
  onClick={() => window.dispatchEvent(new Event('logo-tap'))}
>
  James <span>Keenan</span>
</a>
```

- [ ] **Step 5: Add EasterEgg to layout.js**

```js
import EasterEgg from '../components/UI/EasterEgg'
// Add <EasterEgg /> inside <body>
```

- [ ] **Step 6: Run tests**

```bash
npm test easterEgg
```
Expected: PASS — 4 tests

- [ ] **Step 7: Test in browser**

Type "hire" anywhere on the page — modal appears for 3 seconds. On mobile, tap the logo 5 times quickly.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: easter egg triggered by typing 'hire' or tapping logo 5x"
```

---

## Task 21: Final Assembly — page.js and Real Content

**Files:**
- Rewrite: `src/app/page.js`

- [ ] **Step 1: Write the complete page.js**

```js
// src/app/page.js
import Header from '../components/Header/Header'
import Hero from '../components/Hero/Hero'
import About from '../components/About/About'
import Skills from '../components/Skills/Skills'
import Work from '../components/Work/Work'
import Contact from '../components/Contact/Contact'
import Footer from '../components/Footer/Footer'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Work />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Add your real project data**

Open `src/data/projects.js` and replace each placeholder with real project info:
- Real `title` and `description`
- Actual `tech` array matching the filter tags
- Real `githubUrl`
- Real `liveUrl` (if deployed) or `null`
- Add real screenshot files to `public/projects/`

- [ ] **Step 3: Update About bio**

In `src/components/About/About.js`, replace the placeholder `<p>` tags with your real bio. Also update the "Currently" card text.

- [ ] **Step 4: Update Contact and Footer URLs**

In both `Contact.js` and `Footer.js`, replace `YOUR_EMAIL`, `YOUR_GITHUB`, `YOUR_LINKEDIN` with real values.

- [ ] **Step 5: Add resume PDF**

Copy your resume PDF to `public/resume.pdf`.

- [ ] **Step 6: Verify full page in browser**

Check every section end-to-end:
- Page load animation fires on refresh
- Header goes transparent → glass on scroll
- Hero: particles, typewriter, split character, magnetic buttons
- About: scramble heading, counters count up, photo appears
- Skills: icons stagger in, tooltips on hover
- Work: 3 projects show, filter works, 3D tilt on hover
- Contact: form fields, submit sends email, copy button works
- Footer: social links work, year shows correctly

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: complete page assembly with real content"
```

---

## Task 22: Responsive Verification Pass

- [ ] **Step 1: Test mobile (375px)**

In browser DevTools, set viewport to iPhone SE (375×667). Verify:
- Header: logo + hamburger only visible, no nav
- Hamburger opens full-screen overlay menu
- Hero: name readable, buttons stacked vertically
- About: single column, photo on top
- Skills: 3-column icon grid
- Work: single column, image on top per project
- Filter tags: horizontally scrollable
- Contact: form full-width, submit button full-width
- Footer: centered column layout

- [ ] **Step 2: Test tablet (768px)**

Set viewport to iPad (768×1024). Verify:
- Header nav visible (may be compressed)
- About: single column
- Work: single column project rows
- No layout overflow

- [ ] **Step 3: Test desktop (1440px)**

Set viewport to 1440px wide. Verify:
- Content max-width respected (nothing stretches too wide)
- Work project rows alternate left/right correctly

- [ ] **Step 4: Test reduced motion**

In DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`. Verify page loads without animation jank and content is fully visible.

- [ ] **Step 5: Fix any issues found**

Address any layout or overflow issues discovered in steps 1-4.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "fix: responsive layout pass across mobile, tablet, desktop"
```

---

## Task 23: Production Build Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 2: Run linter**

```bash
npm run lint
```
Fix any warnings or errors before building.

- [ ] **Step 3: Run production build**

```bash
npm run build
```
Expected: Build completes with no errors. Note any warnings — address `Image` alt text, missing `key` props, or unused imports.

- [ ] **Step 4: Run production server locally**

```bash
npm run start
```
Open `http://localhost:3000` and verify the production build behaves identically to dev.

- [ ] **Step 5: Verify Three.js loads in production**

The `dynamic(() => import('./ParticleField'), { ssr: false })` import should work correctly in production. Confirm particles appear in the hero.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: production build verified, all tests passing"
```

---

## Content Checklist

Before considering the site complete, confirm all placeholder content has been replaced:

- [ ] `src/data/projects.js` — 3 real projects with screenshots in `/public/projects/`
- [ ] `src/components/About/About.js` — real bio paragraphs and "Currently" card text
- [ ] `src/components/Contact/Contact.js` — real email, GitHub URL, LinkedIn URL
- [ ] `src/components/Footer/Footer.js` — real GitHub URL, LinkedIn URL
- [ ] `public/resume.pdf` — your real resume
- [ ] `.env.local` — EmailJS service ID, template ID, public key
- [ ] `src/app/layout.js` metadata description — personalize the SEO description
