// src/components/UI/CinematicCanvas.js
'use client'
import { useEffect } from 'react'

// Temporary stub — calls onDone after 4s to verify the shell works end-to-end.
// This will be replaced in Task 3 with the real R3F WarpField implementation.
export default function CinematicCanvas({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(34,211,238,0.03)' }} />
  )
}
