"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { useAuth } from "@/components/auth-provider"
import type { Campana } from "@/lib/supabase"

export default function CrearCampanaPage() {
  const searchParams = useSearchParams()
  const campanaId = searchParams.get("id")
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingCampana, setLoadingCampana] = useState(false)

  const [formData, setFormData] = useState<Partial<Campana>>({
    nombre: "",
    descripcion: "",
    tipo: "sellos",
    objetivo: 10,
    recompensa: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    activa: true,
  })

  useEffect(() => {
    if (campanaId) {
      const fetchCampana = async () => {
        setLoadingCampana(true)
        try {
          const { data, error } = await supabase.from("campanas").select("*").eq("id", campanaId).single()

          if (error) {
            throw error
          }

          if (data) {
            // Formatear la fecha para el input date
            const fechaInicio = data.fecha_inicio ? data.fecha_inicio.split("T")[0] : ""
            const fechaFin = data.fecha_fin ? data.fecha_fin.split("T")[0] : ""

            setFormData({
              ...data,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin,
            })
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error al cargar la campaña",
            description: error.message,
          })
        } finally {
          setLoadingCampana(false)
        }
      }

      fetchCampana()
    }
  }, [campanaId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activa: checked }))
  }

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value as "sellos" | "puntos" | "visitas" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const campanaData = {
        ...formData,
        negocio_id: user.id,
      }

      let response

      if (campanaId) {
        // Actualizar campaña existente
        response = await supabase.from("campanas").update(campanaData).eq("id", campanaId)
      } else {
        // Crear nueva campaña
        response = await supabase.from("campanas").insert([campanaData])
      }

      if (response.error) {
        throw response.error
      }

      toast({
        title: campanaId ? "Campaña actualizada" : "Campaña creada",
        description: campanaId
          ? "La campaña ha sido actualizada exitosamente"
          : "La campaña ha sido creada exitosamente",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al guardar la campaña",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingCampana) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{campanaId ? "Editar Campaña" : "Crear Nueva Campaña"}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{campanaId ? "Editar Campaña" : "Crear Nueva Campaña"}</CardTitle>
            <CardDescription>Configura los detalles de tu campaña de lealtad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Campaña</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Programa de Puntos Premium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion || ""}
                onChange={handleChange}
                placeholder="Describe los beneficios de tu programa de lealtad"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Programa</Label>
              <RadioGroup value={formData.tipo} onValueChange={handleTipoChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sellos" id="sellos" />
                  <Label htmlFor="sellos">Programa de Sellos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="puntos" id="puntos" />
                  <Label htmlFor="puntos">Programa de Puntos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visitas" id="visitas" />
                  <Label htmlFor="visitas">Programa de Visitas</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo">
                {formData.tipo === "sellos"
                  ? "Sellos necesarios para recompensa"
                  : formData.tipo === "puntos"
                    ? "Puntos necesarios para recompensa"
                    : "Visitas necesarias para recompensa"}
              </Label>
              <Input
                id="objetivo"
                name="objetivo"
                type="number"
                min="1"
                value={formData.objetivo}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recompensa">Recompensa</Label>
              <Input
                id="recompensa"
                name="recompensa"
                value={formData.recompensa || ""}
                onChange={handleChange}
                placeholder="Ej: Café gratis, 50% de descuento, etc."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  name="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha de Fin (Opcional)</Label>
                <Input
                  id="fecha_fin"
                  name="fecha_fin"
                  type="date"
                  value={formData.fecha_fin || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="activa" checked={formData.activa} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="activa">Campaña Activa</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader /> : campanaId ? "Actualizar Campaña" : "Crear Campaña"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
