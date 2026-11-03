import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Choose from '../components/Whychoose'
import FAQ from '../pages/FAQ'

const { getAll } = vi.hoisted(() => ({ getAll: vi.fn() }))

vi.mock('../lib/api', () => ({ promallCombinedApi: { getAll } }))

beforeEach(() => {
  getAll.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const equipmentGuide = {
  id: 1,
  title: 'Equipment for your next project',
  subtitle: 'Explore our current technology range',
  description: 'Plan equipment for your workplace.\n\nCompare our latest product categories.',
  subsections: [
    { id: 20, title: 'Display technology', description: 'Explore current displays.', display_order: 20 },
    { id: 10, title: 'Workplace accessories', description: 'Find accessories for your team.' },
    {
      id: 1,
      title: 'Meeting room equipment',
      description: 'Compare conferencing systems.\nCheck compatibility with your room.\n\nAsk about current availability.',
      display_order: -1,
    },
  ],
}

function renderFaq() {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/faqs']}>
        <FAQ />
      </MemoryRouter>
    </HelmetProvider>,
  )
}

function readFaqSchema() {
  const script = document.querySelector('script[type="application/ld+json"]')
  if (!script?.textContent) throw new Error('FAQ structured data is missing')
  return JSON.parse(script.textContent) as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[]
  }
}

function controlledPanel(button: HTMLElement) {
  const id = button.getAttribute('aria-controls')
  expect(id).toBeTruthy()
  const panel = document.getElementById(id ?? '')
  expect(panel).not.toBeNull()
  return panel as HTMLElement
}

describe('CMS homepage content', () => {
  it('waits for promallsection2 and renders backend copy with ordered subsection paragraphs', async () => {
    let resolveRequest!: (value: unknown) => void
    getAll.mockReturnValue(new Promise(resolve => { resolveRequest = resolve }))

    const { container } = render(<Choose />)

    expect(container).toBeEmptyDOMElement()

    await act(async () => {
      resolveRequest({
        promallsection2: equipmentGuide,
        additional_website_content: [{ id: 99, heading: 'Legacy content', description: 'Do not use this collection.' }],
      })
    })

    expect(screen.getByText(equipmentGuide.title).tagName).toBe('P')
    expect(screen.getByRole('heading', { level: 2, name: equipmentGuide.subtitle })).toBeVisible()
    expect(screen.getByText('Plan equipment for your workplace.')).toBeVisible()
    expect(screen.getByText('Compare our latest product categories.')).toBeVisible()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    expect(cards.map(card => within(card).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Meeting room equipment',
      'Workplace accessories',
      'Display technology',
    ])
    expect(Array.from(cards[0].querySelectorAll('p')).map(paragraph => paragraph.textContent)).toEqual([
      'Compare conferencing systems.\nCheck compatibility with your room.',
      'Ask about current availability.',
    ])
    expect(screen.queryByText('Legacy content')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Shop IT Equipment and Computer Accessories in Nigeria' })).not.toBeInTheDocument()
  })

  it.each([1, 8])('renders the backend subsection count of %i without adding or capping cards', async (count) => {
    const subsections = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      title: `Backend category ${index + 1}`,
      description: `Current information for category ${index + 1}.`,
      display_order: index,
    }))
    getAll.mockResolvedValue({ promallsection2: { ...equipmentGuide, subsections } })

    await act(async () => { render(<Choose />) })

    expect(screen.getAllByRole('article')).toHaveLength(count)
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(subsections.map(section => section.title))
  })

  it.each([
    { scenario: 'missing section', response: {} },
    { scenario: 'null section', response: { promallsection2: null } },
    { scenario: 'invalid section', response: { promallsection2: [equipmentGuide] } },
    { scenario: 'missing title', response: { promallsection2: { subtitle: equipmentGuide.subtitle, description: equipmentGuide.description } } },
    { scenario: 'blank title', response: { promallsection2: { ...equipmentGuide, title: ' \n ' } } },
    { scenario: 'missing subtitle', response: { promallsection2: { title: equipmentGuide.title, description: equipmentGuide.description } } },
    { scenario: 'non-text subtitle', response: { promallsection2: { ...equipmentGuide, subtitle: 12 } } },
    { scenario: 'missing description', response: { promallsection2: { title: equipmentGuide.title, subtitle: equipmentGuide.subtitle } } },
    { scenario: 'blank description', response: { promallsection2: { ...equipmentGuide, description: '\n\n ' } } },
    {
      scenario: 'only legacy content',
      response: { additional_website_content: [{ id: 1, heading: 'Legacy guide', description: 'Legacy content is not a fallback.' }] },
    },
  ])('renders no guide for $scenario', async ({ response }) => {
    getAll.mockResolvedValue(response)

    let container!: HTMLElement
    await act(async () => { ({ container } = render(<Choose />)) })

    expect(container).toBeEmptyDOMElement()
  })

  it.each([undefined, null, [], 'not an array'])('keeps a valid introduction without cards for missing or invalid subsections (%s)', async (subsections) => {
    getAll.mockResolvedValue({ promallsection2: { ...equipmentGuide, subsections } })

    await act(async () => { render(<Choose />) })

    expect(screen.getByRole('heading', { level: 2, name: equipmentGuide.subtitle })).toBeVisible()
    expect(screen.getByText('Plan equipment for your workplace.')).toBeVisible()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })

  it('filters malformed subsections without dropping valid backend cards', async () => {
    getAll.mockResolvedValue({
      promallsection2: {
        ...equipmentGuide,
        subsections: [
          null,
          {},
          { id: 1, title: ' ', description: 'No usable heading.' },
          { id: 2, title: 'Missing description' },
          { id: 3, title: 'Empty description', description: '\n ' },
          { id: 4, title: 99, description: 'Non-text heading.' },
          { id: 5, title: 'Non-text description', description: false },
          equipmentGuide.subsections[0],
        ],
      },
    })

    await act(async () => { render(<Choose />) })

    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 3, name: 'Display technology' })).toBeVisible()
    expect(screen.getByText('Explore current displays.')).toBeVisible()
  })

  it('renders no guide when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getAll.mockRejectedValue(new Error('CMS unavailable'))

    let container!: HTMLElement
    await act(async () => { ({ container } = render(<Choose />)) })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders intro and subsection HTML-like values as inert text', async () => {
    const textGuide = {
      ...equipmentGuide,
      title: '<img src="x" onerror="blocked()">',
      subtitle: '<script>blocked()</script>',
      description: '<p onclick="blocked()">Introduction</p>',
      subsections: [{
        id: 1,
        title: '<strong>Category title</strong>',
        description: '<a href="javascript:blocked()">Category details</a>\n\n<script>blockedAgain()</script>',
      }],
    }
    getAll.mockResolvedValue({ promallsection2: textGuide })

    let container!: HTMLElement
    await act(async () => { ({ container } = render(<Choose />)) })

    expect(screen.getByText(textGuide.title)).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: textGuide.subtitle })).toBeVisible()
    expect(screen.getByText(textGuide.description)).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: textGuide.subsections[0].title })).toBeVisible()
    expect(screen.getByText('<a href="javascript:blocked()">Category details</a>')).toBeVisible()
    expect(screen.getByText('<script>blockedAgain()</script>')).toBeVisible()
    expect(container.querySelector('script, img, strong, a, [onclick], [onerror]')).toBeNull()
  })
})

describe('CMS FAQ content', () => {
  it('shows a loading state without FAQ controls or schema until the request finishes', async () => {
    let resolveRequest!: (value: unknown) => void
    getAll.mockReturnValue(new Promise(resolve => { resolveRequest = resolve }))

    renderFaq()

    expect(screen.getByRole('status')).toHaveTextContent('Loading FAQs…')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()

    await act(async () => { resolveRequest({ website_faqs: [] }) })

    expect(screen.getByRole('status')).toHaveTextContent('No FAQs are available right now.')
  })

  it('uses only usable CMS FAQs in display order and keeps their schema identical', async () => {
    getAll.mockResolvedValue({
      website_faqs: [
        { id: 20, question: 'Which models are available?', answer: 'Contact us for current models.', display_order: 20 },
        { id: 1, question: '   ', answer: 'An answer without a question.', display_order: 0 },
        { id: 2, question: 'A question without an answer?', answer: '\n ', display_order: 1 },
        { id: 10, question: 'How can our company order?', answer: 'Request a business quotation.', display_order: 10 },
      ],
    })
    const user = userEvent.setup()

    await act(async () => { renderFaq() })

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveAccessibleName('How can our company order?')
    expect(buttons[1]).toHaveAccessibleName('Which models are available?')
    expect(screen.queryByRole('button', { name: 'Where can I buy IT equipment in Nigeria?' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'General questions' })).toBeVisible()

    await waitFor(() => {
      expect(readFaqSchema().mainEntity.map(item => [item.name, item.acceptedAnswer.text])).toEqual([
        ['How can our company order?', 'Request a business quotation.'],
        ['Which models are available?', 'Contact us for current models.'],
      ])
    })
    expect(new Set(buttons.map(button => button.id)).size).toBe(2)
    const [first, second] = buttons
    const firstPanel = controlledPanel(first)
    const secondPanel = controlledPanel(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(firstPanel).toHaveAttribute('hidden')
    expect(secondPanel).not.toBeVisible()

    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(firstPanel).not.toHaveAttribute('hidden')
    expect(firstPanel).toBeVisible()

    await user.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(firstPanel).toHaveAttribute('hidden')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(secondPanel).toBeVisible()

    await user.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(secondPanel).toHaveAttribute('hidden')
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0)

  })

  it.each([
    { scenario: 'missing collection', response: {} },
    { scenario: 'empty collection', response: { website_faqs: [] } },
    { scenario: 'invalid collection', response: { website_faqs: { question: 'Not an array' } } },
    {
      scenario: 'unusable records',
      response: {
        website_faqs: [
          null,
          { id: 1, question: '  ', answer: 'No question' },
          { id: 2, question: 'No answer?', answer: '\n ' },
          { id: 3, question: 42, answer: 'Invalid question' },
          { id: 4, question: 'Invalid answer?', answer: null },
        ],
      },
    },
  ])('shows an empty state without fallback FAQs or schema for a $scenario', async ({ response }) => {
    getAll.mockResolvedValue(response)

    await act(async () => { renderFaq() })

    expect(screen.getByRole('status')).toHaveTextContent('No FAQs are available right now.')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    await waitFor(() => {
      expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
    })
  })

  it('shows a request failure without fallback FAQs or schema', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getAll.mockRejectedValue(new Error('CMS unavailable'))

    await act(async () => { renderFaq() })

    expect(screen.getByRole('alert')).toHaveTextContent('FAQs could not be loaded. Please try again later.')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    await waitFor(() => {
      expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
    })
  })
})
