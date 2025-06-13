"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "./api-client"

interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  tipo_usuario: "padre" | "conductor"
  verificado: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionTimerId, setSessionTimerId] = useState<NodeJS.Timeout | null>(null)

  const startSessionTimer = () => {
    if (sessionTimerId) {
      clearTimeout(sessionTimerId);
    }
    const id = setTimeout(() => {
      console.log("Session expired due to inactivity. Logging out.");
      logout();
    }, 10 * 60 * 1000);
    setSessionTimerId(id);
  };

  const clearSessionTimer = () => {
    if (sessionTimerId) {
      clearTimeout(sessionTimerId);
      setSessionTimerId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        apiClient.setToken(token)
        console.log("AuthProvider useEffect - Token set to apiClient:", token)
        startSessionTimer();
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        clearSessionTimer();
      }
    } else {
      clearSessionTimer();
    }

    setLoading(false)

    return () => {
      clearSessionTimer();
    };
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)

      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data) {
        const { user: userData, token } = response.data
        setUser(userData)
        apiClient.setToken(token)
        localStorage.setItem("user_data", JSON.stringify(userData))
        localStorage.setItem("auth_token", token)
        startSessionTimer();
        return { success: true }
      }

      return { success: false, error: "Error inesperado" }
    } catch (error) {
      return { success: false, error: "Error de conexión" }
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData)

      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data) {
        const { user: newUser, token } = response.data
        setUser(newUser)
        apiClient.setToken(token)
        localStorage.setItem("user_data", JSON.stringify(newUser))
        localStorage.setItem("auth_token", token)
        startSessionTimer();
        return { success: true }
      }

      return { success: false, error: "Error inesperado" }
    } catch (error) {
      return { success: false, error: "Error de conexión" }
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.removeToken()
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    clearSessionTimer();
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
