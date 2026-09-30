const REDIRECT_KEY = 'login_redirect'

/**
 * Remembers where to send the user after a successful sign in.
 * Stored instead of a ?redirect= query param so URLs stay clean (/login, /signup).
 */
export function setLoginRedirect(path: string): void {
  if (!path.startsWith('/')) return
  sessionStorage.setItem(REDIRECT_KEY, path)
}

export function getLoginRedirect(fallback = '/dashboard'): string {
  const stored = sessionStorage.getItem(REDIRECT_KEY)
  if (!stored || !stored.startsWith('/')) return fallback
  return stored
}

export function clearLoginRedirect(): void {
  sessionStorage.removeItem(REDIRECT_KEY)
}
