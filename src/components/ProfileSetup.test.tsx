import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileSetup } from './ProfileSetup'
import type { UserProfile } from '../types/userProfile'

const mockProfile: UserProfile = {
  role: 'remote_worker',
  computerHours: '4_to_6',
  remoteWork: 'sometimes',
  mainGoal: 'general_awareness',
  reminderFrequency: '45',
}

describe('ProfileSetup — no profile (edit mode)', () => {
  it('shows "Tell us about yourself" heading', () => {
    render(<ProfileSetup profile={null} onSave={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText(/tell us about yourself/i)).toBeInTheDocument()
  })

  it('shows all role cards', () => {
    render(<ProfileSetup profile={null} onSave={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByRole('button', { name: /remote worker/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /student/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /developer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /researcher/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /office worker/i })).toBeInTheDocument()
  })

  it('Save profile button is disabled when no role selected', () => {
    render(<ProfileSetup profile={null} onSave={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save profile/i })).toBeDisabled()
  })

  it('enables Save profile after selecting a role', async () => {
    const user = userEvent.setup()
    render(<ProfileSetup profile={null} onSave={vi.fn()} onSkip={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /remote worker/i }))
    expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled()
  })

  it('calls onSave with profile when saved', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileSetup profile={null} onSave={onSave} onSkip={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /remote worker/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].role).toBe('remote_worker')
  })

  it('calls onSkip when Skip for now is clicked', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<ProfileSetup profile={null} onSave={vi.fn()} onSkip={onSkip} />)
    await user.click(screen.getByRole('button', { name: /skip for now/i }))
    expect(onSkip).toHaveBeenCalledOnce()
  })
})

describe('ProfileSetup — existing profile (view mode)', () => {
  it('shows profile summary card when profile exists', () => {
    render(<ProfileSetup profile={mockProfile} onSave={vi.fn()} />)
    expect(screen.getByText(/remote worker/i)).toBeInTheDocument()
  })

  it('shows Edit profile button in view mode', () => {
    render(<ProfileSetup profile={mockProfile} onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
  })

  it('enters edit mode when Edit profile is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfileSetup profile={mockProfile} onSave={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /edit profile/i }))
    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument()
  })
})

describe('ProfileSetup — student role', () => {
  it('can select student role and save', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileSetup profile={null} onSave={onSave} onSkip={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /student/i }))
    await user.click(screen.getByRole('button', { name: /save profile/i }))
    expect(onSave.mock.calls[0][0].role).toBe('student')
  })
})
