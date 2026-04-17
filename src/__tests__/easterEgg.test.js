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
