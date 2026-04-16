// src/hooks/useTextScramble.js
import { useState, useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

/**
 * Scrambles text character-by-character, then resolves to the original.
 * Accessibility note: wrap the output in a container with aria-label={text}
 * and put aria-hidden="true" on the visible scrambled element to prevent
 * screen readers from announcing intermediate scrambled strings.
 */
export default function useTextScramble(text, trigger) {
  const [displayText, setDisplayText] = useState(text)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!trigger) {
      clearInterval(intervalRef.current)
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
