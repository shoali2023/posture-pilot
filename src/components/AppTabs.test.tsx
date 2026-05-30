import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppTabs } from './AppTabs'
import type { AppTab } from './AppTabs'

describe('AppTabs — rendering', () => {
  it('renders all five tabs', () => {
    render(<AppTabs activeTab="home" onTabChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /live check/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /reminders/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders a tablist with accessible label', () => {
    render(<AppTabs activeTab="home" onTabChange={vi.fn()} />)
    expect(screen.getByRole('tablist', { name: /main navigation/i })).toBeInTheDocument()
  })
})

describe('AppTabs — active state', () => {
  const tabs: AppTab[] = ['home', 'live', 'reminders', 'analytics', 'settings']

  tabs.forEach(tab => {
    it(`marks "${tab}" tab as aria-selected when active`, () => {
      render(<AppTabs activeTab={tab} onTabChange={vi.fn()} />)
      const activeBtn = document.querySelector('.app-tab-btn--active')
      expect(activeBtn).not.toBeNull()
      expect(activeBtn?.getAttribute('aria-selected')).toBe('true')
    })
  })

  it('marks only one tab as active at a time', () => {
    render(<AppTabs activeTab="analytics" onTabChange={vi.fn()} />)
    const selected = screen.getAllByRole('tab').filter(t => t.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBe(1)
  })
})

describe('AppTabs — interaction', () => {
  it('calls onTabChange with correct tab id when clicked', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<AppTabs activeTab="home" onTabChange={onTabChange} />)
    await user.click(screen.getByRole('tab', { name: /analytics/i }))
    expect(onTabChange).toHaveBeenCalledWith('analytics')
  })

  it('calls onTabChange with settings when Settings tab clicked', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<AppTabs activeTab="home" onTabChange={onTabChange} />)
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    expect(onTabChange).toHaveBeenCalledWith('settings')
  })
})
