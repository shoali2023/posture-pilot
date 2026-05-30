import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostureReport } from './PostureReport'
import type { PostureResult } from '../types/posture'

const GOOD_RESULT: PostureResult = {
  status: 'good',
  shoulderTilt: 0.01,
  trunkAngle: 3.2,
  neckOffset: 0.02,
  confidence: 0.93,
  activeConditions: [
    {
      id: 'upright_posture',
      name: 'Upright posture',
      description: 'The user maintains head, shoulders and hips vertically aligned.',
      feedback: 'Good posture. Keep your head, shoulders and hips aligned.',
      userInstruction: 'Sit or stand in front of the camera with a straight back.',
    },
  ],
}

const WARNING_RESULT: PostureResult = {
  status: 'warning',
  shoulderTilt: 0.09,
  trunkAngle: 5.1,
  neckOffset: 0.04,
  confidence: 0.88,
  activeConditions: [
    {
      id: 'shoulder_imbalance',
      name: 'Uneven shoulders',
      description: 'One shoulder appears noticeably higher than the other.',
      feedback: 'Try to relax your shoulders and keep them level.',
      userInstruction: 'Face the camera and relax both shoulders.',
    },
  ],
}

describe('PostureReport — null result', () => {
  it('renders waiting message when result is null', () => {
    render(<PostureReport result={null} />)
    expect(screen.getByText(/Waiting for body detection/i)).toBeInTheDocument()
  })

  it('does not throw when result is null', () => {
    expect(() => render(<PostureReport result={null} />)).not.toThrow()
  })
})

describe('PostureReport — good posture', () => {
  it('renders the FeedbackBadge with Good Posture text', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByText('Good Posture')).toBeInTheDocument()
  })

  it('shows confidence percentage in the header', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByText(/93%/)).toBeInTheDocument()
  })

  it('shows condition name "Upright posture"', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByText('Upright posture')).toBeInTheDocument()
  })

  it('shows the condition ID as a code element', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByText('upright_posture')).toBeInTheDocument()
  })

  it('shows "Detected conditions" heading', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByText(/Detected conditions/i)).toBeInTheDocument()
  })
})

describe('PostureReport — technical metrics hidden by default', () => {
  it('does NOT show shoulderTilt metric label by default', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.queryByText(/Shoulder tilt/i)).not.toBeInTheDocument()
  })

  it('does NOT show trunkAngle metric label by default', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.queryByText(/Trunk angle/i)).not.toBeInTheDocument()
  })

  it('does NOT show neckOffset metric label by default', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.queryByText(/Neck offset/i)).not.toBeInTheDocument()
  })

  it('shows the "Show posture details" toggle button', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    expect(screen.getByRole('button', { name: /show posture details/i })).toBeInTheDocument()
  })

  it('toggle button has aria-expanded=false by default', () => {
    render(<PostureReport result={GOOD_RESULT} />)
    const btn = screen.getByRole('button', { name: /show posture details/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('PostureReport — Show posture details reveals metrics', () => {
  it('clicking "Show posture details" reveals shoulder tilt', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText(/Shoulder tilt/i)).toBeInTheDocument()
  })

  it('clicking "Show posture details" reveals trunk angle', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText(/Trunk angle/i)).toBeInTheDocument()
  })

  it('clicking "Show posture details" reveals neck offset', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText(/Neck offset/i)).toBeInTheDocument()
  })

  it('button label changes to "Hide posture details" after opening', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByRole('button', { name: /hide posture details/i })).toBeInTheDocument()
  })

  it('toggle button has aria-expanded=true after opening', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    const btn = screen.getByRole('button', { name: /hide posture details/i })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('shoulder tilt value formatted to 3 decimal places', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText('0.010')).toBeInTheDocument()
  })

  it('trunk angle value formatted to 1 decimal place with degree symbol', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText('3.2')).toBeInTheDocument()
    expect(screen.getByText('°')).toBeInTheDocument()
  })
})

describe('PostureReport — Hide posture details hides metrics', () => {
  it('clicking Hide after opening hides shoulder tilt again', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    await user.click(screen.getByRole('button', { name: /hide posture details/i }))
    expect(screen.queryByText(/Shoulder tilt/i)).not.toBeInTheDocument()
  })

  it('clicking Hide restores "Show posture details" label', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={GOOD_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    await user.click(screen.getByRole('button', { name: /hide posture details/i }))
    expect(screen.getByRole('button', { name: /show posture details/i })).toBeInTheDocument()
  })
})

describe('PostureReport — issue condition (warning)', () => {
  it('shows the issue condition name', () => {
    render(<PostureReport result={WARNING_RESULT} />)
    expect(screen.getByText('Uneven shoulders')).toBeInTheDocument()
  })

  it('shows the feedback text', () => {
    render(<PostureReport result={WARNING_RESULT} />)
    expect(screen.getByText(/relax your shoulders/)).toBeInTheDocument()
  })

  it('shows "What to do:" label for issue conditions', () => {
    render(<PostureReport result={WARNING_RESULT} />)
    expect(screen.getByText(/What to do/i)).toBeInTheDocument()
  })

  it('shows the userInstruction text', () => {
    render(<PostureReport result={WARNING_RESULT} />)
    expect(screen.getByText(/relax both shoulders/)).toBeInTheDocument()
  })

  it('shows shoulderTilt value after revealing details', async () => {
    const user = userEvent.setup()
    render(<PostureReport result={WARNING_RESULT} />)
    await user.click(screen.getByRole('button', { name: /show posture details/i }))
    expect(screen.getByText(/Shoulder tilt/i)).toBeInTheDocument()
  })
})

// ── low_visibility must always render red/bad — not orange ─────────────────
const LOW_VIS_RESULT: PostureResult = {
  status: 'bad',
  shoulderTilt: 0,
  trunkAngle: 0,
  neckOffset: 0,
  confidence: 0.28,
  activeConditions: [
    {
      id: 'low_visibility',
      name: 'Low body visibility',
      description: 'The system cannot reliably detect your head, shoulders or hips.',
      feedback: 'Your body cannot be detected reliably. Reposition yourself in front of the camera.',
      userInstruction: 'Make sure your head, shoulders and hips are fully visible in the frame.',
    },
  ],
}

describe('PostureReport — low_visibility is always bad/red', () => {
  it('renders low_visibility condition card with condition-card--bad class', () => {
    const { container } = render(<PostureReport result={LOW_VIS_RESULT} />)
    const card = container.querySelector('.condition-card')!
    expect(card).toHaveClass('condition-card--bad')
    expect(card).not.toHaveClass('condition-card--warning')
  })

  it('does NOT apply condition-card--warning even if status is passed as warning', () => {
    const staleResult: PostureResult = { ...LOW_VIS_RESULT, status: 'warning' }
    const { container } = render(<PostureReport result={staleResult} />)
    const card = container.querySelector('.condition-card')!
    expect(card).toHaveClass('condition-card--bad')
    expect(card).not.toHaveClass('condition-card--warning')
  })

  it('renders FeedbackBadge with bad class when result.status is bad', () => {
    const { container } = render(<PostureReport result={LOW_VIS_RESULT} />)
    const badge = container.querySelector('.feedback-badge')!
    expect(badge).toHaveClass('feedback-badge--bad')
  })

  it('shows the low_visibility condition name', () => {
    render(<PostureReport result={LOW_VIS_RESULT} />)
    expect(screen.getByText('Low body visibility')).toBeInTheDocument()
  })

  it('shows "What to do:" for low_visibility', () => {
    render(<PostureReport result={LOW_VIS_RESULT} />)
    const card = screen.getByText('Low body visibility').closest('.condition-card') as HTMLElement
    expect(within(card).getByText(/What to do/i)).toBeInTheDocument()
  })

  it('shows low confidence in header', () => {
    render(<PostureReport result={LOW_VIS_RESULT} />)
    expect(screen.getByText(/28%/)).toBeInTheDocument()
  })
})
