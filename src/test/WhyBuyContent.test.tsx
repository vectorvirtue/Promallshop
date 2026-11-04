import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Whybuy from '../components/Whybuy'
import { QuoteFormProvider, useQuoteForm } from '../context/QuoteFormContext'

const { getAll } = vi.hoisted(() => ({ getAll: vi.fn() }))

vi.mock('../lib/api', () => ({ promallCombinedApi: { getAll } }))

const content = {
  id: 1,
  title: 'Support for your technology purchase',
  subtitle: 'Technology sourcing for your organisation',
  subsections: [
    { id: 20, title: 'Procurement support', description: 'Discuss larger orders with our team.', display_order: 20 },
    { id: 10, title: 'Current technology choices', description: 'Compare current product specifications.' },
    {
      id: 1,
      title: 'Help with product selection',
      description: 'Tell us about your project.\nCompare equipment for your needs.\n\nAsk about availability and delivery.',
      display_order: -1,
    },
  ],
}

const procurementTitle = 'Buy IT Equipment for Your Business or Organisation'

beforeEach(() => {
  getAll.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function QuoteFormState() {
  const { isOpen } = useQuoteForm()
  return <output aria-label="Quote form state">{isOpen ? 'open' : 'closed'}</output>
}

function renderWhyBuy() {
  return render(
    <QuoteFormProvider>
      <MemoryRouter>
        <Whybuy />
        <QuoteFormState />
      </MemoryRouter>
    </QuoteFormProvider>,
  )
}

function expectProcurementOnly() {
  const procurement = screen.getByRole('region', { name: procurementTitle })
  expect(procurement).toBeVisible()
  expect(screen.getAllByRole('region')).toEqual([procurement])
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  expect(screen.queryByRole('heading', { name: 'Why Choose Promallshop for IT Equipment in Nigeria?' })).not.toBeInTheDocument()
}

describe('CMS reasons to buy', () => {
  it('waits for promallsection3 and maps backend headings and ordered reason paragraphs', async () => {
    let resolveRequest!: (value: unknown) => void
    getAll.mockReturnValue(new Promise(resolve => { resolveRequest = resolve }))

    renderWhyBuy()

    expectProcurementOnly()

    await act(async () => { resolveRequest({ promallsection3: content }) })

    const section = screen.getByRole('region', { name: content.subtitle })
    expect(within(section).getByText(content.title).tagName).toBe('P')
    expect(within(section).getByRole('heading', { level: 2, name: content.subtitle })).toBeVisible()
    const items = within(section).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items.map(item => within(item).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Help with product selection',
      'Current technology choices',
      'Procurement support',
    ])
    expect(Array.from(items[0].querySelectorAll('p')).map(paragraph => paragraph.textContent)).toEqual([
      'Tell us about your project.\nCompare equipment for your needs.',
      'Ask about availability and delivery.',
    ])
    expect(screen.queryByRole('heading', { name: 'A Wide Range of Technology Products' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: procurementTitle })).toBeVisible()
  })

  it.each([1, 8])('renders all %i backend reasons without adding or capping items', async (count) => {
    const subsections = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      title: `Backend reason ${index + 1}`,
      description: `Information for reason ${index + 1}.`,
      display_order: index,
    }))
    getAll.mockResolvedValue({ promallsection3: { ...content, subsections } })

    await act(async () => { renderWhyBuy() })

    const section = screen.getByRole('region', { name: content.subtitle })
    expect(within(section).getAllByRole('listitem')).toHaveLength(count)
    expect(within(section).getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(subsections.map(item => item.title))
  })

  it.each([
    { scenario: 'missing section', response: {} },
    { scenario: 'null section', response: { promallsection3: null } },
    { scenario: 'array instead of a singleton', response: { promallsection3: [content] } },
    { scenario: 'non-object section', response: { promallsection3: 'Reasons to buy' } },
    { scenario: 'missing title', response: { promallsection3: { subtitle: content.subtitle, subsections: content.subsections } } },
    { scenario: 'blank title', response: { promallsection3: { ...content, title: ' \n ' } } },
    { scenario: 'non-text title', response: { promallsection3: { ...content, title: false } } },
    { scenario: 'missing subtitle', response: { promallsection3: { title: content.title, subsections: content.subsections } } },
    { scenario: 'blank subtitle', response: { promallsection3: { ...content, subtitle: '  ' } } },
    { scenario: 'non-text subtitle', response: { promallsection3: { ...content, subtitle: 15 } } },
  ])('keeps procurement without a static reasons fallback for $scenario', async ({ response }) => {
    getAll.mockResolvedValue(response)

    await act(async () => { renderWhyBuy() })

    expectProcurementOnly()
  })

  it.each([undefined, null, [], 'not an array'])(
    'retains valid backend headings without a list for absent or invalid subsections (%s)',
    async (subsections) => {
      getAll.mockResolvedValue({ promallsection3: { ...content, subsections } })

      await act(async () => { renderWhyBuy() })

      const section = screen.getByRole('region', { name: content.subtitle })
      expect(within(section).getByText(content.title)).toBeVisible()
      expect(within(section).getByRole('heading', { level: 2, name: content.subtitle })).toBeVisible()
      expect(within(section).queryByRole('list')).not.toBeInTheDocument()
      expect(within(section).queryAllByRole('heading', { level: 3 })).toHaveLength(0)
    },
  )

  it('filters malformed reasons while retaining usable backend items', async () => {
    getAll.mockResolvedValue({
      promallsection3: {
        ...content,
        subsections: [
          null,
          {},
          { id: 1, title: ' ', description: 'No usable title.' },
          { id: 2, title: 'Missing description' },
          { id: 3, title: 'Blank description', description: '\n ' },
          { id: 4, title: 12, description: 'Non-text title.' },
          { id: 5, title: 'Non-text description', description: false },
          content.subsections[0],
        ],
      },
    })

    await act(async () => { renderWhyBuy() })

    const section = screen.getByRole('region', { name: content.subtitle })
    expect(within(section).getAllByRole('listitem')).toHaveLength(1)
    expect(within(section).getByRole('heading', { level: 3, name: 'Procurement support' })).toBeVisible()
    expect(within(section).getByText('Discuss larger orders with our team.')).toBeVisible()
  })

  it('keeps procurement available when the CMS request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getAll.mockRejectedValue(new Error('CMS unavailable'))

    await act(async () => { renderWhyBuy() })

    expectProcurementOnly()
  })

  it('keeps procurement links and the quote action working when section3 is absent', async () => {
    getAll.mockResolvedValue({})
    const user = userEvent.setup()

    await act(async () => { renderWhyBuy() })

    const procurement = screen.getByRole('region', { name: procurementTitle })
    expect(within(procurement).getByRole('link', { name: 'Explore Products' })).toHaveAttribute('href', '/shop')
    expect(within(procurement).getByRole('link', { name: 'Contact Our Team' })).toHaveAttribute('href', '/contact')
    expect(screen.getByLabelText('Quote form state')).toHaveTextContent('closed')

    await user.click(within(procurement).getByRole('button', { name: 'Request a Quote' }))

    expect(screen.getByLabelText('Quote form state')).toHaveTextContent('open')
  })

  it('renders HTML-like backend values as inert text', async () => {
    const textContent = {
      ...content,
      title: '<img src="x" onerror="blocked()">',
      subtitle: '<script>blocked()</script>',
      subsections: [{
        id: 1,
        title: '<strong>A backend reason</strong>',
        description: '<a href="javascript:blocked()">Reason details</a>\n\n<script>blockedAgain()</script>',
      }],
    }
    getAll.mockResolvedValue({ promallsection3: textContent })

    await act(async () => { renderWhyBuy() })

    const section = screen.getByRole('region', { name: textContent.subtitle })
    expect(within(section).getByText(textContent.title)).toBeVisible()
    expect(within(section).getByRole('heading', { level: 2, name: textContent.subtitle })).toBeVisible()
    expect(within(section).getByRole('heading', { level: 3, name: textContent.subsections[0].title })).toBeVisible()
    expect(within(section).getByText('<a href="javascript:blocked()">Reason details</a>')).toBeVisible()
    expect(within(section).getByText('<script>blockedAgain()</script>')).toBeVisible()
    expect(section.querySelector('script, img, strong, a, [onclick], [onerror]')).toBeNull()
  })
})
