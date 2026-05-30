import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrivacyFirstCard } from './PrivacyFirstCard'

describe('PrivacyFirstCard — full', () => {
  it('renders privacy-first title', () => {
    render(<PrivacyFirstCard />)
    expect(screen.getByText(/privacy-first design/i)).toBeInTheDocument()
  })

  it('mentions local processing', () => {
    render(<PrivacyFirstCard />)
    expect(screen.getByText(/runs entirely in your browser/i)).toBeInTheDocument()
  })

  it('states no video is uploaded', () => {
    render(<PrivacyFirstCard />)
    expect(screen.getByText(/no video.*ever sent|no video or image is ever uploaded/i)).toBeInTheDocument()
  })

  it('states no account is required', () => {
    render(<PrivacyFirstCard />)
    expect(screen.getByText(/no account.*sign-in/i)).toBeInTheDocument()
  })

  it('mentions ability to clear data', () => {
    render(<PrivacyFirstCard />)
    expect(screen.getByText(/clear all saved data/i)).toBeInTheDocument()
  })
})

describe('PrivacyFirstCard — compact', () => {
  it('renders compact text instead of list', () => {
    render(<PrivacyFirstCard compact />)
    expect(screen.getByText(/all analysis runs locally/i)).toBeInTheDocument()
  })

  it('does not render full list in compact mode', () => {
    render(<PrivacyFirstCard compact />)
    expect(screen.queryByText(/privacy-first design/i)).not.toBeInTheDocument()
  })
})
