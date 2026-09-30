import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  authApi,
  clearAuth,
  getToken,
  getUser,
  saveToken,
  saveUser,
  usersApi,
  type LoginResponse,
} from '../lib/api'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string
  company: string
  status: string
  verified: number
  address?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string
  signIn: (email: string, password: string, remember?: boolean) => Promise<AuthUser>
  signOut: () => void
  updateProfile: (changes: Partial<AuthUser>) => Promise<AuthUser>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? (getUser() as AuthUser | null) : null))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const signIn = useCallback(async (email: string, password: string, remember = false) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await authApi.login(email, password) as LoginResponse
      saveToken(res.data.token, remember)
      saveUser(res.data.user, remember)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  /**
   * Saves the profile to the backend, then refreshes the cached user so the
   * header, dashboard and this form all show the new values without a reload.
   * `address` is sent even though the record has no column for it yet — the
   * backend will add it, and sending it now keeps the client ready.
   * Password fields are never included on an update.
   */
  const updateProfile = useCallback(async (changes: Partial<AuthUser>) => {
    if (!user) throw new Error('You need to be signed in to update your profile.')
    setIsLoading(true)
    setError('')

    const payload: Record<string, unknown> = {}
    if (changes.name !== undefined) payload.name = changes.name
    if (changes.email !== undefined) payload.email = changes.email
    if (changes.phone !== undefined) payload.phone = changes.phone
    if (changes.company !== undefined) payload.company = changes.company
    if (changes.address !== undefined) payload.address = changes.address

    try {
      const res = await usersApi.update(user.id, payload) as { data?: AuthUser }
      // the endpoint may not echo the user back — merge into what we sent
      const updated: AuthUser = { ...user, ...changes, ...(res.data ?? {}) }
      saveUser(updated, getToken() === localStorage.getItem('token'))
      setUser(updated)
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save your details.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /** Password change — does not touch the cached user, the record is unchanged. */
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (!user) throw new Error('You need to be signed in to change your password.')
    if (newPassword !== confirmPassword) {
      throw new Error('The new passwords do not match.')
    }
    setIsLoading(true)
    setError('')
    try {
      await usersApi.changePassword(user.id, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not change your password.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, error, signIn, signOut, updateProfile, changePassword }),
    [user, isLoading, error, signIn, signOut, updateProfile, changePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
