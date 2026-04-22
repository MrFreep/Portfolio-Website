# Scroll Transitions & Header Animation — Design Spec

## Goal

Two changes to improve the page's cinematic feel after the Light Burst intro:
1. Header opening animation: drop from above with simultaneous blur reveal
2. Section scroll transitions: standardise all section entrances to blur reveal + fade up

---

## Header Opening Animation

**File:** `src/components/Header/Header.js`

### Current behaviour
Header slides in from the left: `initial={{ x: -80, opacity: 0 }}`, fires when `ready` state becomes `true` at 2.8s.

### New behaviour
Header drops from above while unblurring:

```js
initial={{ y: -72, opacity: 0, filter: 'blur(8px)' }}
animate={ready ? { y: 0, opacity: 1, filter: 'blur(0px)' } : { y: -72, opacity: 0, filter: 'blur(8px)' }}
transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
```

- `y: -72` = header height (72px), so it starts exactly flush with the top edge and hidden above it
- `filter: 'blur(8px)'` — matches the blur reveal language of the hero and section transitions
- Everything else (timing, `ready` state, mobile delay) remains unchanged

---

## Scroll Transitions — Blur Reveal + Fade Up

Standardise all section entrance animations to blur reveal combined with a fade up: `blur(16px) opacity:0 y:30 → blur(0) opacity:1 y:0`. Applied at the content wrapper level inside each section. Duration: 0.9s, ease: `[0.16, 1, 0.3, 1]`.

### About (`src/components/About/About.js`)

**Current:** bio slides from left (`x: -40`), photo slides from right (`x: 40`), duration 0.7s.

**New:** both elements use blur reveal + fade up, staggered:
- Bio: `initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}`, `whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`, delay 0s
- Photo: same, delay 0.15s

Remove `x` from both `initial` and `whileInView`. Keep `viewport`, `once: false, margin: '-150px'`. Keep parallax `y` spring on both wrappers — that runs independently and is unaffected.

Counter items (`CounterItem`): change `initial={{ opacity: 0, y: 30 }}` → `initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}`, `whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`.

### Skills (`src/components/Skills/Skills.js`)

**Current:** `SkillCard` uses `initial={{ opacity: 0, y: 24 }}`.

**New:** `initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}`, `whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`. Duration 0.5s (fast — many cards). Keep stagger delay (`index * 0.035`). Keep `whileHover`.

### Work (`src/components/Work/Work.js`)

No section-level entrance animation currently. Add blur reveal + fade up to the heading and filters bar only (NOT to project rows — those have their own `AnimatePresence` layout animations for filter switching, which must not be touched).

Add to the `<h2>` and filter `<div>` individually:
```js
// heading
<motion.h2
  className={styles.heading}
  initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}
  whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
  viewport={{ once: false, margin: '-150px' }}
  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
>
  {headingText}
</motion.h2>

// filters bar
<motion.div
  className={styles.filters}
  initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
  whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
  viewport={{ once: false, margin: '-150px' }}
  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
  role="group"
  aria-label="Filter projects by technology"
>
```

### Contact (`src/components/Contact/Contact.js`)

**Current:** outer `motion.div` uses `initial={{ opacity: 0, y: 40 }}`.

**New:** change to `initial={{ opacity: 0, filter: 'blur(16px)', y: 30 }}`, `whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`. Duration 0.9s.

---

## What Does NOT Change

- `useTextScramble` triggers on `isInView` — untouched
- `AnimatePresence` / `LayoutGroup` in Work for filter switching — untouched
- `whileHover` on SkillCard — untouched
- Counter animation logic (`useAnimatedCounter`) — untouched
- Parallax springs in About — untouched
- Mobile header delay (600ms) — untouched
- All section CSS, layout, and spacing — untouched

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/Header/Header.js` | `x: -80` → `y: -72, filter: blur(8px)` on initial/animate |
| `src/components/About/About.js` | Bio + photo: `x: ±40` → `filter: blur(16px) + y: 30`. Counter items: add `filter: blur(10px)` |
| `src/components/Skills/Skills.js` | SkillCard: `y: 24` → `filter: blur(8px) + y: 16` |
| `src/components/Work/Work.js` | Add blur reveal + fade up to `<h2>` and filters `<div>` |
| `src/components/Contact/Contact.js` | Outer wrapper: `y: 40` → `filter: blur(16px) + y: 30` |
