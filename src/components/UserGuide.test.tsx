import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserGuide } from './UserGuide'
import { GESTURE_DICTIONARY } from '../data/gestureDictionary'

describe('UserGuide — setup section', () => {
  it('renders the main heading', () => {
    render(<UserGuide />)
    expect(
      screen.getByText('How to position yourself before starting')
    ).toBeInTheDocument()
  })

  it('renders 10 setup steps', () => {
    const { container } = render(<UserGuide />)
    const ol = container.querySelector('ol.setup-steps')!
    expect(ol).toBeTruthy()
    const items = ol.querySelectorAll('li.setup-step')
    expect(items.length).toBeGreaterThanOrEqual(10)
  })

  it('mentions Start/Stop/Reset controls in the steps', () => {
    render(<UserGuide />)
    const guideText = screen.getByRole('region', { name: /User guide/i }).textContent ?? ''
    expect(guideText).toMatch(/Start|Stop|Reset/i)
  })

  it('step 1 mentions camera distance', () => {
    render(<UserGuide />)
    expect(screen.getByText(/1\.5.+metre/i)).toBeInTheDocument()
  })
})

describe('UserGuide — posture recognition section', () => {
  it('renders "Postures recognised by the system" heading', () => {
    render(<UserGuide />)
    expect(screen.getByText('Postures recognised by the system')).toBeInTheDocument()
  })

  it('renders a card for every gesture in the dictionary', () => {
    render(<UserGuide />)
    GESTURE_DICTIONARY.forEach((g) => {
      expect(screen.getByText(g.name)).toBeInTheDocument()
    })
  })

  it('shows the description for each gesture', () => {
    render(<UserGuide />)
    GESTURE_DICTIONARY.forEach((g) => {
      expect(screen.getByText(g.description)).toBeInTheDocument()
    })
  })

  it('shows "How to achieve it:" label for each gesture', () => {
    render(<UserGuide />)
    const labels = screen.getAllByText(/How to achieve it:/i)
    expect(labels.length).toBe(GESTURE_DICTIONARY.length)
  })

  it('shows "System feedback:" label for each gesture', () => {
    render(<UserGuide />)
    const labels = screen.getAllByText(/System feedback:/i)
    expect(labels.length).toBe(GESTURE_DICTIONARY.length)
  })
})

describe('UserGuide — collapsible technical details', () => {
  it('renders <details> elements for landmark information', () => {
    const { container } = render(<UserGuide />)
    const detailsElements = container.querySelectorAll('details')
    expect(detailsElements.length).toBe(GESTURE_DICTIONARY.length)
  })

  it('details elements have "Body points analysed" summary', () => {
    render(<UserGuide />)
    const summaries = screen.getAllByText(/Body points analysed/i)
    expect(summaries.length).toBe(GESTURE_DICTIONARY.length)
  })

  it('details are collapsed by default (no open attribute)', () => {
    const { container } = render(<UserGuide />)
    const detailsElements = container.querySelectorAll('details')
    detailsElements.forEach((el) => {
      expect(el).not.toHaveAttribute('open')
    })
  })
})
