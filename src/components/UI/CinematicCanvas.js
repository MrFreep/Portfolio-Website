// src/components/UI/CinematicCanvas.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const COUNT = 2000
const CANVAS_STYLE = { position: 'absolute', inset: 0 }

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

function WarpField({ onDone, settleStartRef }) {
  const pointsRef = useRef()
  const linesRef  = useRef()
  const tex       = useStarTexture()

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

  const currPos = useRef(new Float32Array(COUNT * 3))
  const linePos = useRef(new Float32Array(COUNT * 2 * 3))

  const phaseRef    = useRef('bang')
  const phaseStart  = useRef(0)
  const initialised = useRef(false)
  const doneFired   = useRef(false)

  useFrame(({ clock }) => {
    const t       = clock.elapsedTime
    const phase   = phaseRef.current
    const pos     = currPos.current
    const lp      = linePos.current

    if (!initialised.current) {
      initialised.current = true
      phaseStart.current  = t
    }

    const elapsed = t - phaseStart.current

    if (phase === 'bang') {
      const progress = Math.min(elapsed / 0.8, 1)
      const eased    = progress * progress * (3 - 2 * progress)
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
        phaseRef.current   = 'warp'
        phaseStart.current = t
      }
    }

    else if (phase === 'warp') {
      const progress = Math.min(elapsed / 1.7, 1)
      let stretch
      if      (progress < 0.35) stretch = progress / 0.35
      else if (progress < 0.75) stretch = 1.0
      else                      stretch = 1.0 - (progress - 0.75) / 0.25
      const stretchAmt = stretch * 3.5

      for (let i = 0; i < COUNT; i++) {
        const ix  = i * 3
        const lix = i * 6
        const tx = targets[ix], ty = targets[ix+1], tz = targets[ix+2]
        const len = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1
        lp[lix]   = tx;  lp[lix+1] = ty;  lp[lix+2] = tz
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
        phaseRef.current   = 'settle'
        phaseStart.current = t
        if (settleStartRef) settleStartRef.current = t
        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   = targets[i*3]
          pos[i*3+1] = targets[i*3+1]
          pos[i*3+2] = targets[i*3+2]
        }
        if (pointsRef.current)
          pointsRef.current.geometry.attributes.position.needsUpdate = true
      }
    }

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

function LensFlare({ settleStartRef }) {
  const meshRef       = useRef()
  const tex           = useStarTexture()
  const sweepStart    = useRef(null)
  const posArr        = useMemo(() => new Float32Array([0, 0, 2]), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // Only active during SETTLE — settleStartRef.current is set when SETTLE begins
    if (settleStartRef.current === null) {
      meshRef.current.visible = false
      sweepStart.current = null
      return
    }

    if (sweepStart.current === null) {
      sweepStart.current = clock.elapsedTime
    }

    const elapsed  = clock.elapsedTime - sweepStart.current
    const progress = Math.min(elapsed / 1.4, 1)
    const x        = -15 + progress * 30

    meshRef.current.position.set(x, 0, 2)
    meshRef.current.visible = progress < 1.0
  })

  return (
    <points ref={meshRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1}
          array={posArr}
          itemSize={3}
        />
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
