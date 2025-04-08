"use client"

import { useEffect, useState } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"
import { supabase } from "./lib/supabase"
import { Navbar } from "./components/navbar"
import { ProtectedRoute } from "./components/protected-route"
import LoginPage from "./pages/login"
import DashboardPage from "./pages/dashboard"
import CrearCampanaPage from "./pages/crear-campana"
import ClientesPage from "./pages/clientes"
import { Loader } from "./components/ui/loader"

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {session && <Navbar session={session} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-campana"
          element={
            <ProtectedRoute session={session}>
              <CrearCampanaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute session={session}>
              <ClientesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
