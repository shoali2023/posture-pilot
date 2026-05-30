import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostureOverlay } from './PostureOverlay'

describe('PostureOverlay — null status', () => {
  it('renders nothing when status is null', () => {
    const { container } = render(<PostureOverlay status={null} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('PostureOverlay — good status', () => {
  it('renders good overlay without blocking message', () => {
    render(<PostureOverlay status="good" />)
    expect(screen.getByTestId('posture-overlay-good')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeInTheDocument()
    expect(screen.queryByText(/adjustment|check recommended/i)).not.toBeInTheDocument()
  })
})

describe('PostureOverlay — warning status', () => {
  it('renders warning overlay with soft message', () => {
    render(<PostureOverlay status="warning" />)
    expect(screen.getByTestId('posture-overlay-warning')).toBeInTheDocument()
    expect(screen.getByText(/small posture adjustment suggested/i)).toBeInTheDocument()
  })
})

describe('PostureOverlay — bad status', () => {
  it('renders bad overlay with stronger message', () => {
    render(<PostureOverlay status="bad" />)
    expect(screen.getByTestId('posture-overlay-bad')).toBeInTheDocument()
    expect(screen.getByText(/posture check recommended/i)).toBeInTheDocument()
  })
})

describe('PostureOverlay — low visibility', () => {
  it('renders low-visibility hint when lowVisibility is true', () => {
    render(<PostureOverlay status="good" lowVisibility={true} />)
    expect(screen.getByTestId('posture-overlay-low-visibility')).toBeInTheDocument()
    expect(screen.getByText(/cannot see your head/i)).toBeInTheDocument()
    expect(screen.getByText(/adjust distance/i)).toBeInTheDocument()
  })

  it('overrides status when lowVisibility is active', () => {
    render(<PostureOverlay status="bad" lowVisibility={true} />)
    expect(screen.getByTestId('posture-overlay-low-visibility')).toBeInTheDocument()
    expect(screen.queryByTestId('posture-overlay-bad')).not.toBeInTheDocument()
  })
})
