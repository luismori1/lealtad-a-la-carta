"use client"

import { useEffect, useState } from "react"
import Link from "next/navigation"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { useAuth } from "@/components/auth-provider"
import type { Cliente, Campana } from "@/lib/supabase"
import { Search, UserPlus } from "lucide-react"

export default function ClientesPage() {
  const searchParams = useSearchParams()
  const campanaId = searchParams.get("campana")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [selectedCampana, setSelectedCampana] = useState<string>(campanaId || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from("campanas")
          .select("*")
          .eq("negocio_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setCampanas(data || [])

        // Si no hay campaña seleccionada y hay campañas disponibles, seleccionar la primera
        if (!selectedCampana && data && data.length > 0) {
          setSelectedCampana(data[0].id)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error al cargar campañas",
          description: error.message,
        })
      }
    }

    fetchCampanas()
  }, [toast, selectedCampana, user])

  useEffect(() => {
    if (selectedCampana) {
      const fetchClientes = async () => {
        setLoading(true)
        try {
          const { data, error } = await supabase
            .from("clientes")
            .select("*")
            .eq("campana_id", selectedCampana)
            .order("created_at", { ascending: false })

          if (error) {
            throw error
          }

          setClientes(data || [])
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error al cargar clientes",
            description: error.message,
          })
        } finally {
          setLoading(false)
        }
      }

      fetchClientes()
    } else {
      setLoading(false)
    }
  }, [selectedCampana, toast])

  const filteredClientes = clientes.filter((cliente) => {
    const searchValue = searchTerm.toLowerCase()
    return (
      cliente.nombre.toLowerCase().includes(searchValue) ||
      (cliente.apellido && cliente.apellido.toLowerCase().includes(searchValue)) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchValue)) ||
      (cliente.telefono && cliente.telefono.includes(searchValue))
    )
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link href="/agregar-cliente">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCampana}
                onChange={(e) => setSelectedCampana(e.target.value)}
              >
                <option value="">Todas las campañas</option>
                {campanas.map((campana) => (
                  <option key={campana.id} value={campana.id}>
                    {campana.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">No hay clientes</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchTerm
                ? "No se encontraron clientes con ese criterio de búsqueda."
                : "Agrega tu primer cliente para comenzar a fidelizarlo."}
            </p>
            <Button asChild>
              <Link href="/agregar-cliente">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Progreso</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                  <TableHead className="text-right">Última Visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.nombre} {cliente.apellido}
                    </TableCell>
                    <TableCell>{cliente.email || "-"}</TableCell>
                    <TableCell>{cliente.telefono || "-"}</TableCell>
                    <TableCell className="text-right">
                      {cliente.puntos_acumulados} / {campanas.find((c) => c.id === cliente.campana_id)?.objetivo || "-"}
                    </TableCell>
                    <TableCell className="text-right">{cliente.visitas}</TableCell>
                    <TableCell className="text-right">
                      {cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Resumen de estadísticas */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                clientes.filter(
                  (c) => c.ultima_visita && new Date(c.ultima_visita) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visitas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.reduce((sum, cliente) => sum + cliente.visitas, 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
