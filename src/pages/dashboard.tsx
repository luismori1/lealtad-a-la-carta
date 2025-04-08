"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Loader } from "../components/ui/loader"
import { useToast } from "../components/ui/use-toast"
import type { Campana } from "../lib/supabase"
import { CreditCard, Plus, Users } from "lucide-react"

export default function DashboardPage() {
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) return

        const { data, error } = await supabase
          .from("campanas")
          .select("*")
          .eq("negocio_id", user.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setCampanas(data || [])
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error al cargar campañas",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCampanas()
  }, [toast])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/crear-campana">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : campanas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">No tienes campañas</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Crea tu primera campaña de lealtad para comenzar a fidelizar a tus clientes.
            </p>
            <Button asChild>
              <Link to="/crear-campana">
                <Plus className="mr-2 h-4 w-4" />
                Crear Campaña
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campanas.map((campana) => (
            <Card key={campana.id}>
              <CardHeader>
                <CardTitle>{campana.nombre}</CardTitle>
                <CardDescription>
                  {campana.tipo === "sellos"
                    ? "Programa de sellos"
                    : campana.tipo === "puntos"
                      ? "Programa de puntos"
                      : "Programa de visitas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{campana.descripcion || "Sin descripción"}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Objetivo:</p>
                    <p className="text-lg font-bold">
                      {campana.objetivo} {campana.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estado:</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        campana.activa ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campana.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/clientes?campana=${campana.id}`}>
                    <Users className="mr-2 h-4 w-4" />
                    Ver Clientes
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/crear-campana?id=${campana.id}`}>Editar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Resumen de estadísticas */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campanas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campanas.filter((c) => c.activa).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
