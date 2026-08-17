export const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL as string) || ''

/**
 * Converts a relative image path from the API into a full URL.
 * Appends ?ngrok-skip-browser-warning=true so ngrok doesn't intercept image requests.
 */
export function getImageUrl(path: string): string {
  if (!path) return ''
  // some products have comma-separated multiple images — use the first one only
  const firstPath = path.split(',')[0].trim()
  if (firstPath.startsWith('http')) {
    if (firstPath.includes('ngrok')) {
      const url = new URL(firstPath)
      url.searchParams.set('ngrok-skip-browser-warning', 'true')
      return url.toString()
    }
    return firstPath
  }
  const clean = firstPath.replace(/^\/+/, '')
  const base = IMAGE_BASE.replace(/\/+$/, '')
  const url = `${base}/${clean}`
  if (IMAGE_BASE.includes('ngrok')) {
    return `${url}?ngrok-skip-browser-warning=true`
  }
  return url
}

const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL as string

/* ── token helpers ── */
export const getToken = (): string | null =>
  localStorage.getItem('token') ?? sessionStorage.getItem('token')

export const saveToken = (token: string, remember = false) => {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('token', token)
}

export const saveUser = (user: unknown, remember = false) => {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('user', JSON.stringify(user))
}

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearAuth = () => {
  ;['token', 'user'].forEach(k => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

/* ── first-time buyer check ── */
export const markAsOrdered = (): void =>
  localStorage.setItem('has_ordered', 'true')

/**
 * Returns true if the user has placed orders before.
 * Checks the API if logged in, falls back to localStorage flag.
 */
export async function checkHasOrderedBefore(): Promise<boolean> {
  if (localStorage.getItem('has_ordered') === 'true') {
    console.log('checkHasOrderedBefore: fast path — already flagged in localStorage')
    return true
  }

  const token = getToken()
  if (!token) {
    console.log('checkHasOrderedBefore: no token found — treating as first-time buyer')
    return false
  }

  console.log('checkHasOrderedBefore: token found, checking orders API...')

  try {
    // fetch directly so we can handle 401 without throwing
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      }
    })

    // 401 = token invalid/expired — clear it and treat as not logged in
    if (res.status === 401) {
      clearAuth()
      return false
    }

    const data = await res.json()
    console.log('Orders response — full:', data)
    console.log('Orders count:', data.count, '| data length:', Array.isArray(data.data) ? data.data.length : 'N/A')

    const hasOrders = (data.count ?? (Array.isArray(data.data) ? data.data.length : 0)) > 0
    if (hasOrders) localStorage.setItem('has_ordered', 'true')
    return hasOrders
  } catch (err) {
    console.error('checkHasOrderedBefore error:', err)
    return false
  }
}

/* ── base headers ── */
const baseHeaders = (auth = false): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

/* ── generic request helper ── */
async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...baseHeaders(auth),
      ...(rest.headers ?? {}),
    },
  })

  const data = await res.json()
  console.log('API response:', res.status, data)

  if (!res.ok) {
    // clear stale token on 401
    if (res.status === 401) clearAuth()
    if (data?.errors) {
      const first = Object.values(data.errors as Record<string, string[]>)[0]
      throw new Error(first[0])
    }
    throw new Error(data?.message || `Request failed (${res.status})`)
  }

  return data as T
}

/* ── auth ── */
export interface LoginResponse {
  success: boolean
  message: string
  // API returns token nested under data
  data: {
    token: string
    token_type: string
    user: {
      id: number
      name: string
      email: string
      phone: string
      company: string
      status: string
      verified: number
    }
  }
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    name: string
    email: string
    phonenumber: string
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    name: string
    email: string
    password: string
    phone: string
  }) =>
    request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
      }),
    }),

  logout: () =>
    request('/logout', { method: 'POST', auth: true }),

  me: () =>
    request('/me', { auth: true }),
}

/* ── products ── */

// in-memory cache — persists for the lifetime of the browser session
const _cache = new Map<string, unknown>()

async function cachedRequest<T>(path: string): Promise<T> {
  if (_cache.has(path)) return _cache.get(path) as T
  const result = await request<T>(path)
  _cache.set(path, result)
  return result
}

export const productsApi = {
  getAll: () => cachedRequest('/products/grouped'),
  getOne: (id: number | string) => request(`/products/${id}`),
  getFeatured: () => cachedRequest('/products/featured'),
  getDiscounted: () => cachedRequest('/products/discounted'),
  getAvailable: () => cachedRequest('/products/available'),
  getByCategory: (categoryId: number | string) => request(`/products/category/${categoryId}`),
  getByBrand: (brandId: number | string) => request(`/products/brand/${brandId}`),
}

/* ── cart ── */
export const cartApi = {
  get: () => request('/cart/my-cart', { auth: true }),
  add: (product_id: string | number, quantity = 1, attributes = '') =>
    request('/cart/add', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ product_id: String(product_id), quantity, attributes }),
    }),
  clear: () => request('/cart/clear', { method: 'DELETE', auth: true }),
}

/* ── wishlist ── */
export const wishlistApi = {
  get: () => request('/wishlist/my-wishlist', { auth: true }),
  add: (product_id: string | number, quantity = 1) =>
    request('/wishlist/add', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ product_id, quantity }),
    }),
  check: (product_id: string | number) =>
    request('/wishlist/check-product', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ product_id }),
    }),
  moveToCart: (id: number | string) =>
    request(`/wishlist/${id}/move-to-cart`, { method: 'POST', auth: true }),
  remove: (id: number | string) =>
    request(`/wishlist/${id}`, { method: 'DELETE', auth: true }),
  clear: () => request('/wishlist/clear', { method: 'DELETE', auth: true }),
}

/* ── delivery costs ── */
export interface DeliveryCost {
  cost_id: number
  name: string
  amount: string
  state: string
  country: string
  company_id: string
  category: string
  quantity_from: number
  quantity_to: number
  extra_unit_charge: number
  min_delivery_period: number
  max_delivery_period: number
}

export const deliveryCostApi = {
  get: (state?: string, country?: string) => {
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (country) params.set('country', country)
    const qs = params.toString()
    return request<{ success: boolean; data: DeliveryCost[]; count: number }>(
      `/delivery-cost${qs ? `?${qs}` : ''}`
    )
  },
}

/* ── orders ── */export const ordersApi = {
  create: (payload: Record<string, unknown>) =>
    request('/orders', { method: 'POST', auth: true, body: JSON.stringify(payload) }),
  getAll: () => request('/orders/my-orders', { auth: true }),
  getOne: (id: number | string) => request(`/orders/${id}`, { auth: true }),
  getByBill: (billNo: string) => request(`/orders/bill/${billNo}`, { auth: true }),
  markPaid: (id: number | string) =>
    request(`/orders/${id}/mark-paid`, { method: 'PATCH', auth: true }),
}

/* ── quote requests ── */
export interface QuoteRequest {
  full_name: string
  company_name: string
  email: string
  phone: string
  product_name: string
  product_id: number | string
  quantity: number
  message?: string
}

export const quoteApi = {
  // Get the current quote threshold (default: 2000000 if not configured)
  getThreshold: () =>
    request<{ success: boolean; threshold: number }>('/settings/quote-threshold')
      .catch(() => ({ success: true, threshold: 2000000 })), // fallback to 2M if endpoint doesn't exist yet

  // Update quote threshold (admin only)
  updateThreshold: (threshold: number) =>
    request('/settings/quote-threshold', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ threshold }),
    }),

  // Submit a quote request
  submit: (payload: QuoteRequest) =>
    request('/quote-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}


// Events API
export const eventsApi = {
  // Get all events
  getAll: () => request('/events'),
  
  // Get upcoming events only
  getUpcoming: () => request('/events/upcoming'),
  
  // Get single event by ID
  getById: (id: number) => request(`/events/${id}`),
}
