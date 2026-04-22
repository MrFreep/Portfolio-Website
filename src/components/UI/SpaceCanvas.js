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
