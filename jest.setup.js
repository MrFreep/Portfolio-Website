// jest.setup.js
import '@testing-library/jest-dom'
import 'jest-canvas-mock'

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => children,
  useFrame: jest.fn(),
  useThree: () => ({ mouse: { x: 0, y: 0 }, camera: {} }),
}))

jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }) => children,
  Bloom: () => null,
}))

jest.mock('lenis', () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
  }))
})
