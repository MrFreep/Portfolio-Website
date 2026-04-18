// src/components/UI/GlobalBackgroundLoader.js
// Thin client wrapper so layout.js (a Server Component) can lazy-load
// GlobalBackground with ssr:false without triggering the Next.js restriction.
'use client'
import dynamic from 'next/dynamic'

const GlobalBackground = dynamic(() => import('./GlobalBackground'), { ssr: false })

export default function GlobalBackgroundLoader() {
  return <GlobalBackground />
}
