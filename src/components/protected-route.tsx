"use client"

import { type ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode
  session: any
}

export function ProtectedRoute({ children, session }: ProtectedRouteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true })
    }
  }, [session, navigate])

  if (!session) {
    return null
  }

  return <>{children}</>
}
