/**
 * CartContext unit tests
 *
 * How it works:
 * - We wrap a tiny helper component in <CartProvider> so the context is available
 * - Each test calls an action (addToCart, removeFromCart, etc.) and checks the result
 * - No real browser, no real API — jsdom fakes the DOM, and we mock localStorage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from '../context/CartContext'

// ── Mock sonner so toast.success() doesn't crash in jsdom ──
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

// ── Mock the API so addToCart doesn't try to hit the network ──
vi.mock('../lib/api', () => ({
  cartApi: { add: vi.fn().mockResolvedValue({}) },
  getToken: vi.fn().mockReturnValue(null), // pretend user is logged out → skips backend sync
}))

// ── A tiny component that exposes cart actions as buttons ──
function TestCart() {
  const { items, totalItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()

  return (
    <div>
      <span data-testid="total">{totalItems}</span>
      <span data-testid="items">{JSON.stringify(items)}</span>

      <button onClick={() => addToCart({ name: 'Logitech Webcam', price: '₦50,000', img: '' })}>
        Add Webcam
      </button>
      <button onClick={() => addToCart({ name: 'Yealink Phone', price: '₦80,000', img: '' }, 3)}>
        Add 3 Phones
      </button>
      <button onClick={() => removeFromCart('Logitech Webcam')}>Remove Webcam</button>
      <button onClick={() => updateQuantity('Logitech Webcam', 2)}>+2 Webcam</button>
      <button onClick={() => updateQuantity('Logitech Webcam', -10)}>Remove via qty</button>
      <button onClick={clearCart}>Clear</button>
    </div>
  )
}

// ── Helper to render inside the provider ──
function setup() {
  render(
    <CartProvider>
      <TestCart />
    </CartProvider>
  )
  return {
    total: () => screen.getByTestId('total').textContent,
    items: () => JSON.parse(screen.getByTestId('items').textContent || '[]'),
    addWebcam: () => userEvent.click(screen.getByText('Add Webcam')),
    add3Phones: () => userEvent.click(screen.getByText('Add 3 Phones')),
    removeWebcam: () => userEvent.click(screen.getByText('Remove Webcam')),
    plus2Webcam: () => userEvent.click(screen.getByText('+2 Webcam')),
    removeViaQty: () => userEvent.click(screen.getByText('Remove via qty')),
    clear: () => userEvent.click(screen.getByText('Clear')),
  }
}

// ── Clear localStorage between tests so they don't bleed into each other ──
beforeEach(() => localStorage.clear())

// ────────────────────────────────────────────────
describe('CartContext', () => {

  it('starts empty', () => {
    const { total } = setup()
    expect(total()).toBe('0')
  })

  it('adds a product with quantity 1', async () => {
    const { addWebcam, total, items } = setup()
    await act(() => addWebcam())
    expect(total()).toBe('1')
    expect(items()[0].name).toBe('Logitech Webcam')
    expect(items()[0].quantity).toBe(1)
  })

  it('adds a product with a custom quantity', async () => {
    const { add3Phones, total } = setup()
    await act(() => add3Phones())
    expect(total()).toBe('3')
  })

  it('increments quantity if same product added twice', async () => {
    const { addWebcam, total, items } = setup()
    await act(() => addWebcam())
    await act(() => addWebcam())
    // should be 1 item with quantity 2, not 2 separate items
    expect(total()).toBe('2')
    expect(items().length).toBe(1)
    expect(items()[0].quantity).toBe(2)
  })

  it('removes a product by name', async () => {
    const { addWebcam, removeWebcam, total } = setup()
    await act(() => addWebcam())
    await act(() => removeWebcam())
    expect(total()).toBe('0')
  })

  it('updates quantity by delta', async () => {
    const { addWebcam, plus2Webcam, items } = setup()
    await act(() => addWebcam())
    await act(() => plus2Webcam())
    expect(items()[0].quantity).toBe(3)
  })

  it('removes item when quantity drops to 0 or below', async () => {
    const { addWebcam, removeViaQty, total } = setup()
    await act(() => addWebcam())
    await act(() => removeViaQty()) // delta = -10, quantity becomes -9 → filtered out
    expect(total()).toBe('0')
  })

  it('clears all items', async () => {
    const { addWebcam, add3Phones, clear, total } = setup()
    await act(() => addWebcam())
    await act(() => add3Phones())
    await act(() => clear())
    expect(total()).toBe('0')
  })

  it('persists cart to localStorage', async () => {
    const { addWebcam } = setup()
    await act(() => addWebcam())
    const saved = JSON.parse(localStorage.getItem('cart_items') || '[]')
    expect(saved[0].name).toBe('Logitech Webcam')
  })

  it('loads cart from localStorage on mount', async () => {
    // Pre-populate localStorage before rendering
    localStorage.setItem('cart_items', JSON.stringify([
      { name: 'Saved Product', price: '₦10,000', img: '', quantity: 5 }
    ]))
    const { total, items } = setup()
    expect(total()).toBe('5')
    expect(items()[0].name).toBe('Saved Product')
  })

})
