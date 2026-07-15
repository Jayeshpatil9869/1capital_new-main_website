import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

export type User = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  profile?: {
    role: string
    role_label: string
  }
}

export type AuthContextType = {
  user: User | null
  accessToken: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('access') : null,
  )

  useEffect(() => {
    if (!accessToken) return
    axios
      .get<User>('/api/auth/me/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null)
        setAccessToken(null)
        window.localStorage.removeItem('access')
        window.localStorage.removeItem('refresh')
      })
  }, [accessToken])

  async function login(username: string, password: string) {
    const res = await axios.post('/api/auth/login/', { username, password })
    const { access, refresh, user: userData } = res.data
    setAccessToken(access)
    setUser(userData)
    window.localStorage.setItem('access', access)
    window.localStorage.setItem('refresh', refresh)
  }

  function logout() {
    setUser(null)
    setAccessToken(null)
    window.localStorage.removeItem('access')
    window.localStorage.removeItem('refresh')
  }

  const value = useMemo(() => ({ user, accessToken, login, logout }), [user, accessToken])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

