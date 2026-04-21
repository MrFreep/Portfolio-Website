// src/__tests__/CinematicIntro.test.js
import { render, act } from '@testing-library/react'
import PageLoader from '../components/UI/PageLoader'

describe('PageLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<PageLoader />)
    expect(container).toBeTruthy()
  })
})
