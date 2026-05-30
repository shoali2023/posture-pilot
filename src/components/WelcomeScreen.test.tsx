import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeScreen } from './WelcomeScreen'
import type { UserProfile } from '../types/userProfile'

const mockProfile: UserProfile = {
  role: 'remote_worker',
  computerHours: '4_to_6',
  remoteWork: 'sometimes',
  mainGoal: 'general_awareness',
  reminderFrequency: '45',
}

const defaultProps = {
  savedProfile: null,
  onContinueWithSaved: vi.fn(),
  onCreateSetup: vi.fn(),
  onContinueWithout: vi.fn(),
  onStartFresh: vi.fn(),
}

describe('WelcomeScreen — no saved profile', () => {
  it('shows PosturePilot tagline', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByText('PosturePilot')).toBeInTheDocument()
  })

  it('shows set up profile button', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByRole('button', { name: /set up your profile/i })).toBeInTheDocument()
  })

  it('shows Skip for now button', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
  })

  it('calls onCreateSetup when Set up profile is clicked', async () => {
    const user = userEvent.setup()
    const onCreateSetup = vi.fn()
    render(<WelcomeScreen {...defaultProps} onCreateSetup={onCreateSetup} />)
    await user.click(screen.getByRole('button', { name: /set up your profile/i }))
    expect(onCreateSetup).toHaveBeenCalledOnce()
  })

  it('calls onContinueWithout when Skip is clicked', async () => {
    const user = userEvent.setup()
    const onContinueWithout = vi.fn()
    render(<WelcomeScreen {...defaultProps} onContinueWithout={onContinueWithout} />)
    await user.click(screen.getByRole('button', { name: /skip for now/i }))
    expect(onContinueWithout).toHaveBeenCalledOnce()
  })

  it('shows disclaimer text', () => {
    render(<WelcomeScreen {...defaultProps} />)
    expect(screen.getByText(/not a medical tool/i)).toBeInTheDocument()
  })
})

describe('WelcomeScreen — with saved profile', () => {
  it('shows Welcome back greeting', () => {
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} />)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('shows saved role label', () => {
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} />)
    expect(screen.getByText(/remote worker/i)).toBeInTheDocument()
  })

  it('shows Continue with saved setup button', () => {
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} />)
    expect(screen.getByRole('button', { name: /continue with saved setup/i })).toBeInTheDocument()
  })

  it('shows Start fresh button', () => {
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} />)
    expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument()
  })

  it('shows Edit setup button', () => {
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} />)
    expect(screen.getByRole('button', { name: /edit setup/i })).toBeInTheDocument()
  })

  it('calls onContinueWithSaved when Continue with saved setup is clicked', async () => {
    const user = userEvent.setup()
    const onContinueWithSaved = vi.fn()
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} onContinueWithSaved={onContinueWithSaved} />)
    await user.click(screen.getByRole('button', { name: /continue with saved setup/i }))
    expect(onContinueWithSaved).toHaveBeenCalledOnce()
  })

  it('calls onStartFresh when Start fresh is clicked', async () => {
    const user = userEvent.setup()
    const onStartFresh = vi.fn()
    render(<WelcomeScreen {...defaultProps} savedProfile={mockProfile} onStartFresh={onStartFresh} />)
    await user.click(screen.getByRole('button', { name: /start fresh/i }))
    expect(onStartFresh).toHaveBeenCalledOnce()
  })
})
