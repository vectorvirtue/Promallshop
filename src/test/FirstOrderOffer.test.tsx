import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FirstOrderOffer } from '../components/Whybuy'

const { getAll } = vi.hoisted(() => ({ getAll: vi.fn() }))

vi.mock('../lib/api', () => ({
  promallCombinedApi: { getAll },
}))

const offer = {
  id: 1,
  title: 'A new customer offer',
  subtitle: 'Save 12% on your next technology purchase',
  description: 'Compare equipment for your project.\nAsk us about current availability.\n\nExplore the latest accessories.\r\n\r\nConfirm the current promotion terms.',
  link: 'https://media.example.test/first-order.png',
}

beforeEach(() => {
  getAll.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderOffer() {
  return render(<MemoryRouter><FirstOrderOffer /></MemoryRouter>)
}

describe('CMS first-order promotion', () => {
  it('waits for backend content and renders its title, subtitle and description paragraphs', async () => {
    let resolveRequest!: (value: unknown) => void
    getAll.mockReturnValue(new Promise(resolve => { resolveRequest = resolve }))

    const { container } = renderOffer()

    expect(container).toBeEmptyDOMElement()

    await act(async () => { resolveRequest({ promallsection1: offer }) })

    const section = screen.getByRole('region', { name: offer.subtitle })
    expect(within(section).getByRole('heading', { level: 2, name: offer.subtitle })).toBeVisible()
    expect(Array.from(section.querySelectorAll('p')).map(paragraph => paragraph.textContent)).toEqual([
      offer.title,
      'Compare equipment for your project.\nAsk us about current availability.',
      'Explore the latest accessories.',
      'Confirm the current promotion terms.',
    ])
    expect(within(section).getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', offer.link)
    expect(section.querySelector('img')).toBeNull()
    expect(screen.queryByText('Your first order')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Enjoy 15% Off Your First Order' })).not.toBeInTheDocument()
  })

  it('shows changed backend copy on the next visit without retaining the previous promotion', async () => {
    getAll.mockResolvedValueOnce({ promallsection1: offer })
    const firstVisit = renderOffer()
    expect(await screen.findByRole('heading', { name: offer.subtitle })).toBeVisible()
    firstVisit.unmount()

    const updated = {
      ...offer,
      title: 'Updated promotion',
      subtitle: 'A fresh offer from our team',
      description: 'The latest terms from the backend.',
      link: 'https://promallshop.com/updated-offer',
    }
    getAll.mockResolvedValueOnce({ promallsection1: updated })

    await act(async () => { renderOffer() })

    expect(screen.getByText(updated.title)).toBeVisible()
    expect(screen.getByRole('heading', { name: updated.subtitle })).toBeVisible()
    expect(screen.getByText(updated.description)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', updated.link)
    expect(screen.queryByText(offer.title)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: offer.subtitle })).not.toBeInTheDocument()
  })

  it('routes Shop Now to a relative backend destination', async () => {
    getAll.mockResolvedValue({ promallsection1: { ...offer, link: '/shop/promotion' } })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<FirstOrderOffer />} />
          <Route path="/shop/promotion" element={<h1>Promotion catalog</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('link', { name: 'Shop Now' }))

    expect(screen.getByRole('heading', { name: 'Promotion catalog' })).toBeVisible()
  })

  it.each([undefined, '', 'http://', 'javascript:blocked()'])(
    'keeps valid promotion copy without a Shop Now button for an absent or unusable link (%s)',
    async (link) => {
      getAll.mockResolvedValue({ promallsection1: { ...offer, link } })

      await act(async () => { renderOffer() })

      const section = screen.getByRole('region', { name: offer.subtitle })
      expect(within(section).getByText(offer.title)).toBeVisible()
      expect(within(section).getByText('Confirm the current promotion terms.')).toBeVisible()
      expect(section.querySelector('img')).toBeNull()
      expect(within(section).queryByRole('link', { name: 'Shop Now' })).not.toBeInTheDocument()
    },
  )

  it.each([
    { scenario: 'missing section', response: {} },
    { scenario: 'null section', response: { promallsection1: null } },
    { scenario: 'an array instead of a singleton', response: { promallsection1: [offer] } },
    { scenario: 'an invalid section', response: { promallsection1: 'Promotion' } },
    { scenario: 'missing title', response: { promallsection1: { subtitle: offer.subtitle, description: offer.description } } },
    { scenario: 'blank title', response: { promallsection1: { ...offer, title: ' \n ' } } },
    { scenario: 'blank subtitle', response: { promallsection1: { ...offer, subtitle: ' ' } } },
    { scenario: 'blank description', response: { promallsection1: { ...offer, description: '\n\n ' } } },
    { scenario: 'a non-text required field', response: { promallsection1: { ...offer, subtitle: 15 } } },
  ])('renders no promotion for $scenario', async ({ response }) => {
    getAll.mockResolvedValue(response)

    let container!: HTMLElement
    await act(async () => { ({ container } = renderOffer()) })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders no placeholder promotion when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getAll.mockRejectedValue(new Error('CMS unavailable'))

    let container!: HTMLElement
    await act(async () => { ({ container } = renderOffer()) })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders CMS HTML-like text as inert text', async () => {
    const textOffer = {
      ...offer,
      title: '<img src="x" onerror="blocked()">',
      subtitle: '<script>blocked()</script>',
      description: '<strong>Promotion details</strong>\n\n<a href="javascript:blocked()">Read terms</a>',
    }
    getAll.mockResolvedValue({ promallsection1: textOffer })

    await act(async () => { renderOffer() })

    const section = screen.getByRole('region', { name: textOffer.subtitle })
    expect(within(section).getByText(textOffer.title)).toBeVisible()
    expect(within(section).getByRole('heading', { name: textOffer.subtitle })).toBeVisible()
    expect(within(section).getByText('<strong>Promotion details</strong>')).toBeVisible()
    expect(within(section).getByText('<a href="javascript:blocked()">Read terms</a>')).toBeVisible()
    expect(section.querySelector('script, img, strong, [onerror], a[href^="javascript:"]')).toBeNull()
  })
})
