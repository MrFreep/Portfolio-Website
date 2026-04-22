// src/components/Hero/ParticleField.js
'use client'
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Shared scroll position — one listener, consumed by both canvas instances
const scrollPos = { current: 0 }

// Soft radial-gradient texture → round glowing star sprites
function useStarTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0,    'rgba(255,255,255,1)')
    g.addColorStop(0.15, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.5,  'rgba(255,255,255,0.25)')
    g.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

// ── Small stars — behind content, slow parallax ──────────────────────────
function BackgroundParticles({ count }) {
  const mesh = useRef()
  const tex  = useStarTexture()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const cyan   = new THREE.Color('#22d3ee')
    const orange = new THREE.Color('#f97316')
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 42
      pos[i * 3 + 1] = (Math.random() - 0.5) * 42
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22
      const r = Math.random()
      if (r < 0.15) {
        // cyan accent
        const c = cyan.clone().lerp(new THREE.Color('#ffffff'), 0.4)
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      } else if (r < 0.24) {
        // orange accent
        const c = orange.clone().lerp(new THREE.Color('#ffffff'), 0.5)
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      } else {
        // pale blue-white
        const warm = Math.random() < 0.06
        col[i * 3]     = warm ? 1.0 : 0.65 + Math.random() * 0.35
        col[i * 3 + 1] = warm ? 0.55 + Math.random() * 0.2 : 0.85 + Math.random() * 0.15
        col[i * 3 + 2] = warm ? 0.25 : 1.0
      }
    }
    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.elapsedTime
    mesh.current.rotation.y = t * 0.012
    mesh.current.rotation.x = t * 0.007
    mesh.current.position.y = scrollPos.current * 0.0016
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07} vertexColors transparent opacity={0.75} sizeAttenuation
        map={tex} alphaMap={tex} alphaTest={0.004} depthWrite={false}
      />
    </points>
  )
}

// ── Large bright stars — above content, faster parallax ─────────────────
function ForegroundParticles({ count }) {
  const mesh = useRef()
  const tex  = useStarTexture()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const cyan   = new THREE.Color('#22d3ee')
    const orange = new THREE.Color('#f97316')
    const white  = new THREE.Color('#e8f4ff')
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 32
      pos[i * 3 + 1] = (Math.random() - 0.5) * 32
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      const pick = Math.random()
      const c = pick < 0.50 ? cyan : pick < 0.72 ? orange : white
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.elapsedTime
    mesh.current.rotation.y = t * 0.020
    mesh.current.rotation.x = t * 0.011
    // Faster drift → strong parallax depth vs background layer
    mesh.current.position.y = scrollPos.current * 0.0042
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.26} vertexColors transparent opacity={0.95} sizeAttenuation
        map={tex} alphaMap={tex} alphaTest={0.004} depthWrite={false}
      />
    </points>
  )
}

// ── Asteroid — occasional bright streak flying across the screen ─────────
// Trail of 6 points fading behind the head; random timing, random direction
const TRAIL = 6

function Asteroid({ initialDelay, colorHex }) {
  const meshRef  = useRef()
  const tex      = useStarTexture()
  const posArray = useMemo(() => new Float32Array(TRAIL * 3), [])
  const colArray = useMemo(() => new Float32Array(TRAIL * 3), [])
  const baseColor = useMemo(() => new THREE.Color(colorHex), [colorHex])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colArray, 3))
    return g
  }, [posArray, colArray])

  const state = useRef({
    active:    false,
    nextSpawn: initialDelay,
    x:         0,
    y:         0,
    speed:     6,
    dir:       1,
  })

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const s = state.current

    if (!s.active) {
      if (t >= s.nextSpawn) {
        s.active = true
        s.dir    = Math.random() > 0.5 ? 1 : -1
        s.x      = s.dir === 1 ? -12 : 12
        s.y      = (Math.random() - 0.5) * 7
        s.speed  = 5 + Math.random() * 7   // 5–12 units/sec
      }
    } else {
      s.x += s.dir * s.speed * delta

      if (Math.abs(s.x) > 12) {
        s.active    = false
        s.nextSpawn = t + 12 + Math.random() * 20   // 12–32 s gap
      }
    }

    if (!meshRef.current) return
    meshRef.current.visible = s.active

    if (s.active) {
      const spacing = s.dir * 0.55   // trail extends opposite to travel direction
      for (let i = 0; i < TRAIL; i++) {
        posArray[i * 3]     = s.x - spacing * i
        posArray[i * 3 + 1] = s.y
        posArray[i * 3 + 2] = 1.5   // closer than stars → renders on top
        const fade = Math.pow(1 - i / TRAIL, 1.5)
        colArray[i * 3]     = baseColor.r * fade
        colArray[i * 3 + 1] = baseColor.g * fade
        colArray[i * 3 + 2] = baseColor.b * fade
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate    = true
    }
  })

  return (
    <points ref={meshRef} geometry={geo}>
      <pointsMaterial
        size={0.38} vertexColors transparent opacity={0.98} sizeAttenuation
        map={tex} alphaMap={tex} alphaTest={0.004} depthWrite={false}
      />
    </points>
  )
}

// ── ScrollSync — keeps shared scrollPos current ───────────────────────────
function ScrollSync() {
  useEffect(() => {
    const onScroll = () => { scrollPos.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}

const CANVAS_STYLE = { position: 'absolute', inset: 0 }

// ── Background layer ──────────────────────────────────────────────────────
export function StarBackground() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 75 }} style={CANVAS_STYLE} dpr={[1, 2]}>
      <ScrollSync />
      <BackgroundParticles count={isMobile ? 900 : 3200} />
      <EffectComposer>
        <Bloom intensity={1.6} luminanceThreshold={0.04} luminanceSmoothing={0.88} height={400} />
      </EffectComposer>
    </Canvas>
  )
}

// ── Foreground layer (above hero content) — bright stars + asteroids ──────
export function StarForeground() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  if (isMobile) return null
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 75 }}
      style={{ ...CANVAS_STYLE, pointerEvents: 'none' }}
      dpr={[1, 2]}
    >
      <ScrollSync />
      <ForegroundParticles count={260} />
      {/* Three asteroids, staggered delays, alternating cyan/orange */}
      <Asteroid initialDelay={4}  colorHex="#22d3ee" />
      <Asteroid initialDelay={18} colorHex="#f97316" />
      <Asteroid initialDelay={30} colorHex="#e8f4ff" />
      <EffectComposer>
        <Bloom intensity={3.2} luminanceThreshold={0.04} luminanceSmoothing={0.88} height={400} />
      </EffectComposer>
    </Canvas>
  )
}

export default StarBackground
