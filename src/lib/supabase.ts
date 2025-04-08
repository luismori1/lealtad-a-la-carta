import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas de Supabase
export type Negocio = {
  id: string
  created_at: string
  nombre: string
  email: string
  telefono?: string
  direccion?: string
}

export type Campana = {
  id: string
  created_at: string
  negocio_id: string
  nombre: string
  descripcion?: string
  tipo: "sellos" | "puntos" | "visitas"
  objetivo: number
  recompensa: string
  fecha_inicio: string
  fecha_fin?: string
  activa: boolean
}

export type Cliente = {
  id: string
  created_at: string
  negocio_id: string
  campana_id: string
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  puntos_acumulados: number
  visitas: number
  ultima_visita?: string
}
