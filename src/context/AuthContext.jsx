import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getToken, setToken, apiFetch } from '../api/client'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setRole(null)
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch('/auth/me')
      const userData = {
        id: data.id,
        uid: String(data.id),
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
      }
      setUser(userData)
      setRole(data.role)
      setProfile(userData)
    } catch {
      setToken(null)
      setUser(null)
      setRole(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.access_token)
    const userData = {
      id: data.user.id,
      uid: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      avatar: data.user.avatar,
    }
    setUser(userData)
    setRole(data.user.role)
    setProfile(userData)
    return data.user
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setRole(null)
    setProfile(null)
  }

  const value = useMemo(
    () => ({
      user,
      role,
      profile,
      loading,
      login,
      logout,
      refreshUser: loadUser,
    }),
    [user, role, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
