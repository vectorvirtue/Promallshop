import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Footer from '../components/Footer'
import Affiliate from '../pages/Affiliate'

afterEach(() => { cleanup() })

describe('Affiliate landing page', () => {
  it('opens from the footer and sends signup links to the affiliate service', async () => {
    const user = userEvent.setup()
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<h1>Promallshop storefront</h1>} />
            <Route path="/become-an-affiliate" element={<Affiliate />} />
          </Routes>
          <Footer />
        </MemoryRouter>
      </HelmetProvider>,
    )

    const affiliateLink = within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Affiliate Program' })
    expect(affiliateLink).toHaveAttribute('href', '/become-an-affiliate')

    await user.click(affiliateLink)

    expect(screen.getByRole('heading', { level: 1, name: 'Affiliate Program — Earn More with Every Sale' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Promallshop storefront' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign Up Now' })).toHaveAttribute('href', 'https://affiliate.promallshop.com/signup')
    expect(screen.getByRole('link', { name: 'Sign up today' })).toHaveAttribute('href', 'https://affiliate.promallshop.com/signup')
  })

  it('supports Enter and Space while keeping only one FAQ answer open', async () => {
    const user = userEvent.setup()
    render(<HelmetProvider><Affiliate /></HelmetProvider>)

    const faqs = screen.getByRole('region', { name: 'Frequently Asked Questions' })
    const first = within(faqs).getByRole('button', { name: 'How do I track my earnings?' })
    const second = within(faqs).getByRole('button', { name: 'Are there any registration fees?' })
    expect(within(faqs).queryAllByRole('region')).toHaveLength(0)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'false')

    first.focus()
    expect(first).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(first).toHaveAttribute('aria-expanded', 'true')
    const firstAnswer = within(faqs).getByRole('region', { name: 'How do I track my earnings?' })
    expect(firstAnswer).toBeVisible()
    expect(first).toHaveAttribute('aria-controls', firstAnswer.id)

    await user.tab()
    expect(second).toHaveFocus()
    await user.keyboard(' ')

    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(firstAnswer).not.toBeVisible()
    expect(second).toHaveAttribute('aria-expanded', 'true')
    const secondAnswer = within(faqs).getByRole('region', { name: 'Are there any registration fees?' })
    expect(secondAnswer).toBeVisible()
    expect(second).toHaveAttribute('aria-controls', secondAnswer.id)

    await user.keyboard(' ')

    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(secondAnswer).not.toBeVisible()
    expect(within(faqs).queryAllByRole('button', { expanded: true })).toHaveLength(0)
    expect(within(faqs).queryAllByRole('region')).toHaveLength(0)
  })
})
