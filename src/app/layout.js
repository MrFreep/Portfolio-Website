import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll    from '../components/UI/SmoothScroll'
import ScrollProgress  from '../components/UI/ScrollProgress'
import CustomCursor    from '../components/UI/CustomCursor'
import EasterEgg       from '../components/UI/EasterEgg'
import SpaceCanvas     from '../components/UI/SpaceCanvas'
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
