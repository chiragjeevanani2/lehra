import { useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'lehra-auth'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(load)

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  }, [session])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    setSession(data)
    return data
  }

  const register = async (username, email, password) => {
    const data = await authApi.register(username, email, password)
    setSession(data)
    return data
  }

  const logout = () => setSession(null)

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, token: session?.token ?? null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
