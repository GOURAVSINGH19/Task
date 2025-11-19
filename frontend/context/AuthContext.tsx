'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { authAPI, profileAPI } from '@/lib/api'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token')
      if (token) {
        fetchUser()
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await profileAPI.get()
      setUser(response.data.user)
    } catch (error) {
      if (typeof window !== 'undefined') {
        Cookies.remove('token')
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password })
    if (typeof window !== 'undefined') {
      Cookies.set('token', response.data.token, { expires: 7 })
    }
    setUser(response.data.user)
  }

  const signup = async (email: string, password: string, name: string) => {
    const response = await authAPI.signup({ email, password, name })
    if (typeof window !== 'undefined') {
      Cookies.set('token', response.data.token, { expires: 7 })
    }
    setUser(response.data.user)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      Cookies.remove('token')
    }
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        user: null,
        loading: true,
        login: async () => {},
        signup: async () => {},
        logout: () => {},
        updateUser: () => {},
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

