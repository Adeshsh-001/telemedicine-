"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "patient" | "asha" | "doctor" | "admin"
  phone?: string
  village?: string
  language?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  role: "patient" | "asha" | "doctor"
  village?: string
  language?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("healthcare-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("healthcare-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would be an API call
      const mockUsers = [
        {
          id: "1",
          name: "Dr. Rajesh Kumar",
          email: "doctor@health.com",
          role: "doctor" as const,
          phone: "+91-9876543210",
        },
        {
          id: "2",
          name: "Priya Singh",
          email: "asha@health.com",
          role: "asha" as const,
          phone: "+91-9876543211",
          village: "Khanna Village",
        },
        {
          id: "3",
          name: "Ravi Patel",
          email: "patient@health.com",
          role: "patient" as const,
          phone: "+91-9876543212",
          village: "Khanna Village",
          language: "pa",
        },
      ]

      const foundUser = mockUsers.find((u) => u.email === email)

      if (foundUser && password === "password123") {
        setUser(foundUser)
        localStorage.setItem("healthcare-user", JSON.stringify(foundUser))
        return true
      } else {
        setError("Invalid email or password")
        return false
      }
    } catch (err) {
      setError("Login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock registration
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        village: userData.village,
        language: userData.language,
      }

      setUser(newUser)
      localStorage.setItem("healthcare-user", JSON.stringify(newUser))
      return true
    } catch (err) {
      setError("Registration failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("healthcare-user")
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
