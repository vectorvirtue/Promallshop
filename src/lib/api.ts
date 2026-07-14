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
    // surface the most useful error message
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
  token: string
  user: {
    name: string
    email: string
    
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
export const productsApi = {
  getAll: () => request('/products/grouped'),
  getOne: (id: number | string) => request(`/products/${id}`),
  getFeatured: () => request('/products/featured'),
  getDiscounted: () => request('/products/discounted'),
  getAvailable: () => request('/products/available'),
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
      body: JSON.stringify({ product_id, quantity, attributes }),
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

/* ── billing / orders ── */
export const billingApi = {
  getAddresses: () => request('/billing-address/my-addresses', { auth: true }),
  addAddress: (payload: Record<string, string>) =>
    request('/billing-address', { method: 'POST', auth: true, body: JSON.stringify(payload) }),
}

export const ordersApi = {
  create: (payload: Record<string, unknown>) =>
    request('/orders', { method: 'POST', auth: true, body: JSON.stringify(payload) }),
  getAll: () => request('/orders/my-orders', { auth: true }),
  getOne: (id: number | string) => request(`/orders/${id}`, { auth: true }),
  getByBill: (billNo: string) => request(`/orders/bill/${billNo}`, { auth: true }),
  markPaid: (id: number | string) =>
    request(`/orders/${id}/mark-paid`, { method: 'PATCH', auth: true }),
}
