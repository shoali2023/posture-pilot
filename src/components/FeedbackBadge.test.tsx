import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackBadge } from './FeedbackBadge'

describe('FeedbackBadge', () => {
  it('renders "Good Posture" for status good', () => {
    render(<FeedbackBadge status="good" />)
    expect(screen.getByText('Good Posture')).toBeInTheDocument()
  })

  it('renders "Warning" for status warning', () => {
    render(<FeedbackBadge status="warning" />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders "Poor Posture" for status bad', () => {
    render(<FeedbackBadge status="bad" />)
    expect(screen.getByText('Poor Posture')).toBeInTheDocument()
  })

  it('applies feedback-badge--good class for good status', () => {
    const { container } = render(<FeedbackBadge status="good" />)
    expect(container.firstChild).toHaveClass('feedback-badge--good')
  })

  it('applies feedback-badge--warning class for warning status', () => {
    const { container } = render(<FeedbackBadge status="warning" />)
    expect(container.firstChild).toHaveClass('feedback-badge--warning')
  })

  it('applies feedback-badge--bad class for bad status', () => {
    const { container } = render(<FeedbackBadge status="bad" />)
    expect(container.firstChild).toHaveClass('feedback-badge--bad')
  })

  it('renders a span element', () => {
    const { container } = render(<FeedbackBadge status="good" />)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })
})
