# James Keenan Portfolio Website — Design Spec
**Date:** 2026-04-14  
**Status:** Approved  
**Goal:** A complete personal portfolio website showcasing James Keenan as a software engineer — personal brand, freelance credibility, and impressive technical execution.

---

## 1. Purpose & Audience

- **Primary:** Personal brand / general credibility presence
- **Secondary:** Freelance client leads
- **Tone:** Professional and polished, but expressive and personal — facts + personality
- **Not:** A resume site or job-hunting landing page

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, single page (`/`) |
| UI | React 19 |
| Styling | CSS Modules per component + Tailwind v4 utilities |
| Animations | Framer Motion |
| 3D / WebGL | React Three Fiber + Drei |
| Post-processing | @react-three/postprocessing (bloom) |
| Smooth scroll | Lenis |
| Contact | EmailJS (no backend required) |
| Icons | react-icons (Simple Icons set) |
| Fonts | Geist Sans (already installed via next/font) |

**Dependencies to add:**
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- `lenis`
- `emailjs-com`
- `react-icons`

---

## 3. File Structure

```
src/
  app/
    page.js              ← composes all sections vertically
    layout.js            ← root fonts, Lenis provider, custom cursor
    globals.css          ← CSS custom properties, noise overlay, scrollbar
  components/
    Header/
      Header.js
      header.module.css
    Hero/
      Hero.js
      hero.module.css
      ParticleField.js   ← React Three Fiber scene
    About/
      About.js
      about.module.css
    Skills/
      Skills.js
      skills.module.css
    Work/
      Work.js
      work.module.css
      ProjectRow.js      ← individual project row component
    Contact/
      Contact.js
      contact.module.css
    Footer/
      Footer.js
      footer.module.css
    UI/
      CustomCursor.js    ← global custom cursor
      PageLoader.js      ← page load animation
      ScrollProgress.js  ← thin top progress bar
  data/
    projects.js          ← all project data (title, description, tech, links, image, video)
    skills.js            ← all skills organized by category
  hooks/
    useTextScramble.js   ← text scramble effect hook
    useMagneticButton.js ← magnetic hover effect hook
    useAnimatedCounter.js ← count-up animation hook
```

---

## 4. Visual Design System

### Color Palette

```css
:root {
  --bg-base:          #0d0a08;   /* near-black, warm undertone — page background */
  --bg-elevated:      #1a1410;   /* slightly lighter depth layer */
  --surface:          color-mix(in oklab, #3d2d22 50%, transparent); /* glass cards */
  --surface-hover:    color-mix(in oklab, #4a3828 60%, transparent); /* card hover */
  --border:           rgba(255, 255, 255, 0.08); /* glass borders */
  --fg:               #fefcfb;   /* primary text — warm white */
  --fg-muted:         #c4b5a8;   /* secondary text — warm grey */
  --accent-cyan:      #22d3ee;   /* CTAs, active states, highlights */
  --accent-orange:    #f97316;   /* tags, badges, secondary highlights */
}
```

### Glass Morphism

Applied to all cards and surfaces:

```css
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
background: var(--surface);
border: 1px solid var(--border);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
border-radius: 16px;
```

### Noise Grain Overlay

Applied site-wide as a fixed `::before` pseudo-element on `body`:
- SVG-based turbulence filter
- 3% opacity
- `pointer-events: none`, `z-index: 9999`
- Makes flat dark background feel tactile and premium

### Typography — Geist Sans

| Role | Size | Weight |
|---|---|---|
| Hero name | 80–96px | 700 |
| Hero tagline | 24px | 400 |
| Section heading | 48px | 700 |
| Section number (bg) | 120px | 700, 5% opacity |
| Card title | 24px | 600 |
| Body | 16px | 400 |
| Tags / labels | 13px | 500 |

### Animation System

- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — spring-like, premium feel
- **Section entrance:** fade up 40px, 0.6s duration
- **Stagger delay:** 0.08s between items
- **Hover transitions:** 0.3s
- **Respect `prefers-reduced-motion`:** all animations disabled when set

### Ambient Background Glows

Two soft, slow-drifting radial gradients positioned behind content:
- Cyan glow: `rgba(34, 211, 238, 0.06)` — drifts slowly top-left area
- Orange glow: `rgba(249, 115, 22, 0.05)` — drifts slowly bottom-right area
- Pure CSS keyframe animation, zero performance cost

---

## 5. Responsive Strategy

**Breakpoints:**
- Mobile: ≤480px
- Tablet: 481px–1024px
- Desktop: ≥1025px

**Key rules:**
- Use `100dvh` (not `100vh`) for full-height sections — fixes iOS Safari address bar bug
- All form inputs `font-size: 16px` minimum — prevents iOS Safari zoom
- Touch device detection via `@media (pointer: coarse)`

**Touch device overrides (pointer: coarse):**
- Custom cursor: hidden
- Magnetic buttons: disabled
- Spotlight effect: disabled
- Lenis: disabled (native touch scroll used instead)
- CSS 3D card tilt: disabled
- Parallax: disabled on mobile, reduced on tablet

**Three.js on mobile:**
- Particle count reduced 70% on mobile
- Disabled entirely on very low-end devices (detect via `navigator.hardwareConcurrency < 4`)
- Mouse-reactive behavior replaced with ambient floating animation

---

## 6. Global Components

### Page Load Animation
- Full-screen dark overlay on initial load
- Geometric particles assemble from center (~2 seconds)
- Particles explode outward and morph into the Hero's Three.js particle field
- Hero content fades in as overlay completes
- One seamless cinematic transition — load animation IS the hero entrance
- Simplified/faster on mobile

### Custom Cursor
- Small circle that smoothly follows mouse with slight lag (Framer Motion spring)
- Morphs: grows into ring on link hover, inverts on button hover, shrinks on click
- Hidden on touch devices via `@media (pointer: coarse)`

### Scroll Progress Bar
- Thin 2px cyan line at very top of viewport
- Fills left-to-right as user scrolls down the page
- `position: fixed`, `z-index: 9998`

### Spotlight Effect
- Soft radial gradient centered on cursor position
- Applied to dark sections (Hero, Contact)
- Illuminates whatever the cursor hovers over
- Disabled on touch devices

---

## 7. Section Specifications

### Header
**Behavior:**
- `position: fixed`, full width, `z-index: 100`
- On load: fully transparent background
- On scroll (>50px): transitions to glass surface + `--border` bottom border
- Smooth transition: 0.3s

**Content:**
- Left: "James Keenan" text logo (links to top)
- Center: anchor nav — Home, About, Skills, Work, Contact
- Right: "Download Resume" button (cyan, magnetic hover, links to `/resume.pdf`)
- Active nav link glows cyan based on current scroll section (Intersection Observer)

**Responsive:**
- Tablet (≤1024px): nav font size reduces, spacing tightens
- Mobile (≤768px): nav hidden, hamburger icon shown → full-screen overlay menu with large centered links, staggered entrance animation
- Note: hamburger threshold (768px) is intentionally wider than the global mobile breakpoint (480px) — nav collapses earlier than other mobile overrides

---

### Hero
**Layout:** Full viewport height (`100dvh`), content center-aligned

**Three.js Particle Field (`ParticleField.js`):**
- Floating point particles, slowly drifting
- Mouse-reactive: particles gently repel/attract to cursor position
- Bloom post-processing: particles glow and bleed light
- Parallax: particles drift at 0.3x scroll speed vs page content
- Mobile: ambient floating only, 70% fewer particles

**Content (center, z-index above canvas):**
- Name: large display text, animated gradient (cyan → orange → warm white, 6s loop via CSS `@property`)
- Split character entrance: each letter animates in individually with staggered spring physics
- Typewriter: cycles through ["Software Engineer", "Full-Stack Developer", "Problem Solver"] with blinking cursor
- Tagline: single punchy line, fades in after typewriter starts
- CTA buttons: "View My Work" (cyan filled) + "Let's Talk" (outlined) — magnetic hover, stack vertically on mobile
- Scroll arrow: bouncing chevron at bottom center

---

### About — `01`
**Layout:** Two columns desktop (text left, photo right) → single column tablet/mobile

**Content:**
- Faint `01` behind section heading
- Text scramble reveal on heading as section enters viewport
- Bio: 2–3 paragraphs — background, what you build, personality
- "Currently" glass card: small card showing current project/focus ("Currently building: this portfolio")
- Profile photo: rounded with subtle glass border, Framer Motion entrance
- Animated counters row: "3 Projects Built", "15 Technologies", "1 Year Experience" — count up on scroll into view (values updated as career grows)

---

### Skills — `02`
**Layout:** Section heading + categorized icon grid

**Categories:**
| Category | Items |
|---|---|
| Languages | JavaScript, CSS, SQL |
| Frontend | React |
| Backend | Express, REST API* |
| Databases | MongoDB, PostgreSQL |
| Testing | Jest, SuperTest* |
| Tools | NPM, Mongoose*, GitHub, VS Code, Postman |

*Text badge (no logo available)

**Behavior:**
- Faint `02` behind heading, text scramble on entrance
- Icons and badges stagger-animate in left to right on scroll
- Tooltip label appears on hover (desktop) / tap (mobile)
- react-icons Simple Icons set for all logo items

---

### Work — `03`
**Layout:** Filter row + full-width stacked project rows

**Filter Tags:**
- Pill buttons: All, React, Node, MongoDB, PostgreSQL, etc.
- Clicking filters projects by tech tag
- Framer Motion `layoutId` — remaining cards glide to new positions smoothly
- Tags row horizontally scrollable on mobile

**Project Row:**
- Alternating left/right image placement (desktop only — single column mobile)
- Image side: screenshot or video preview in glass card with CSS 3D tilt on hover
- Content side: title, description, tech stack pill tags, "Live Demo" + "GitHub" buttons
- Video preview: on hover (desktop) / tap (mobile), static image swaps to screen recording/GIF
- Entrance: slides in from left or right depending on row position, triggered on scroll

**Data shape (`src/data/projects.js`):**
```js
{
  id: 'project-slug',
  title: 'Project Name',
  description: 'Short description.',
  tech: ['React', 'Node', 'MongoDB'],
  image: '/projects/project-name.png',
  video: '/projects/project-name.gif',  // optional
  liveUrl: 'https://...',               // optional
  githubUrl: 'https://github.com/...',
}
```

---

### Contact — `04`
**Layout:** Single column, centered

**Content:**
- Faint `04` behind heading, text scramble on entrance
- Short invite copy: "Let's build something together"
- EmailJS form: Name, Email, Message fields + "Send Message" button (magnetic)
- Success/error state feedback on submit
- Email address displayed below form with one-click copy button
- GitHub + LinkedIn icon links

**Form inputs:** `font-size: 16px` minimum (prevents iOS Safari zoom)

---

### Footer
- Minimal single row
- Left: "James Keenan"
- Center: "© 2026 James Keenan"
- Right: GitHub + LinkedIn icon links
- Top: 1px `--border` separator

---

## 8. Easter Egg

**Trigger (desktop):** Type "hire" on the keyboard anywhere on the page  
**Trigger (mobile):** Tap the header logo 5 times quickly  
**Effect:** A burst of cyan and orange particles explodes from the center of the screen, a fun message appears briefly ("Let's work together! 🚀"), then fades out  
**Implementation:** Global keydown listener, `useRef` to track typed sequence

---

## 9. Data Architecture

All content lives in `src/data/` — no component code needs to change when adding projects or skills.

**Adding a project:** Add one object to `projects.js`  
**Adding a skill:** Add one entry to the relevant category array in `skills.js`  
**Changing bio/counters:** Edit the About component's static content directly (not data-driven, too personal to abstract)

---

## 10. Dependencies Summary

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing lenis emailjs-com react-icons
```

---

## 11. Content Needed Before Implementation

The following real content must be provided before or during implementation:

| Item | Where Used |
|---|---|
| Hero tagline (one punchy sentence) | Hero section |
| Bio copy (2–3 paragraphs) | About section |
| "Currently" card text | About section |
| Real email address | Contact section + Footer |
| GitHub profile URL | Contact + Footer |
| LinkedIn profile URL | Contact + Footer |
| 3 project titles, descriptions, tech stacks, GitHub links | Work section |
| Project screenshots (`.png`) → `/public/projects/` | Work section |
| Project screen recordings or GIFs (optional) → `/public/projects/` | Work section |
| Live demo URLs (optional per project) | Work section |
| Resume PDF → `/public/resume.pdf` | Header download button |
| EmailJS service ID + template ID + public key | Contact form |

---

## 12. Z-Index Stack

| Layer | Z-Index |
|---|---|
| Page load animation | 99999 |
| Custom cursor | 10000 |
| Noise grain overlay | 9999 |
| Scroll progress bar | 9998 |
| Header | 100 |
| Everything else | default |

---

## 13. Out of Scope

- Blog / writing section (future phase — Next.js App Router makes it a natural extension)
- CMS integration
- Authentication
- Dark/light mode toggle
- Analytics (can be added later via Next.js built-in or Vercel Analytics)
