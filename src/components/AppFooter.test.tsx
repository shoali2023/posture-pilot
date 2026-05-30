import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppFooter } from './AppFooter'

describe('AppFooter', () => {
  it('renders PosturePilot brand name', () => {
    render(<AppFooter />)
    expect(screen.getByText('PosturePilot')).toBeInTheDocument()
  })

  it('renders author name', () => {
    render(<AppFooter />)
    expect(screen.getByText(/ali shoeibi/i)).toBeInTheDocument()
  })

  it('renders University of Salamanca', () => {
    render(<AppFooter />)
    expect(screen.getByText(/university of salamanca/i)).toBeInTheDocument()
  })

  it('renders academic description', () => {
    render(<AppFooter />)
    expect(screen.getByText(/intelligent systems|hci|intelligent web/i)).toBeInTheDocument()
  })

  it('renders GitHub link pointing to shoali2023', () => {
    render(<AppFooter />)
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('href', 'https://github.com/shoali2023')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does NOT use the wrong GitHub username', () => {
    render(<AppFooter />)
    const link = screen.getByRole('link', { name: /github/i })
    expect(link.getAttribute('href')).not.toContain('shoavi2023')
  })

  it('renders LinkedIn link', () => {
    render(<AppFooter />)
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/ali-shoeibi01')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders disclaimer text mentioning posture awareness', () => {
    render(<AppFooter />)
    expect(screen.getByText(/posture awareness.*not a medical|not a medical/i)).toBeInTheDocument()
  })

  it('renders academic prototype note', () => {
    render(<AppFooter />)
    expect(screen.getByText(/academic prototype/i)).toBeInTheDocument()
  })
})
