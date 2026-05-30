import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandLogo } from './BrandLogo'

describe('BrandLogo', () => {
  it('renders an img element', () => {
    render(<BrandLogo />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('has accessible alt text by default (horizontal-dark)', () => {
    render(<BrandLogo variant="horizontal-dark" />)
    expect(screen.getByAltText('PosturePilot')).toBeInTheDocument()
  })

  it('uses custom ariaLabel when provided', () => {
    render(<BrandLogo ariaLabel="PosturePilot app logo" />)
    expect(screen.getByAltText('PosturePilot app logo')).toBeInTheDocument()
  })

  it('applies size as height style', () => {
    render(<BrandLogo size="48px" />)
    const img = screen.getByRole('img')
    expect(img).toHaveStyle({ height: '48px' })
  })

  it('renders mark variant with logo mark alt text', () => {
    render(<BrandLogo variant="mark" />)
    expect(screen.getByAltText('PosturePilot logo mark')).toBeInTheDocument()
  })

  it('renders symbol variant with symbol alt text', () => {
    render(<BrandLogo variant="symbol" />)
    expect(screen.getByAltText('PosturePilot symbol')).toBeInTheDocument()
  })

  it('accepts a custom className', () => {
    render(<BrandLogo className="test-class" />)
    const img = screen.getByRole('img')
    expect(img).toHaveClass('test-class')
  })
})
