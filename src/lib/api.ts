import { supabase } from '@/lib/supabase'

export type Perfil = {
  id: string
  email: string | null
  nombre_completo: string | null
  telefono: string | null
  rol: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Solicitud = {
  id: string
  codigo: string
  cliente_id: string
  motorizado_id: string | null
  tipo_servicio: string
  origen_direccion: string
  destino_direccion: string | null
  lat_origen: number | null
  lng_origen: number | null
  lat_destino: number | null
  lng_destino: number | null
  descripcion: string | null
  estado: string
  precio_estimado: number | null
  precio_final: number | null
  distancia_km: number | null
  creado_en: string
  asignado_en: string | null
  completado_en: string | null
}

export type Ganancium = {
  id: string
  motorizado_id: string
  solicitud_id: string | null
  monto: number
  comision: number
  total: number
  descripcion: string | null
  pagada: boolean
  created_at: string
}

export type Notificacion = {
  id: string
  user_id: string
  titulo: string
  mensaje: string | null
  tipo: string | null
  leida: boolean
  data: Record<string, any> | null
  created_at: string
}

type Result<T> = { data: T | null; error: Error | null }

async function handle<T>(builder: any): Promise<Result<T>> {
  const { data, error } = await builder
  if (error) return { data: null, error: new Error(error.message) }
  return { data, error: null }
}

export const api = {
  auth: {
    getSession: () => supabase.auth.getSession(),
    getUser: () => supabase.auth.getUser(),
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    onAuthStateChange: (cb: (event: string, session: any) => void) => supabase.auth.onAuthStateChange(cb),
  },

  perfil: {
    get: async (): Promise<Result<Perfil>> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('No autenticado') }
      return handle(supabase.from('perfiles').select('*').eq('id', user.id).single())
    },
    update: (updates: Partial<Perfil>): Promise<Result<Perfil>> => {
      return handle(supabase.from('perfiles').update(updates).select().single())
    },
  },

  solicitudes: {
    listDisponibles: async (params?: { limit?: number; offset?: number }): Promise<Result<Solicitud[]>> => {
      let query = supabase.from('solicitudes').select('*').eq('estado', 'confirmada').order('creado_en', { ascending: false })
      if (params?.limit) query = query.limit(params.limit)
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit ?? 20) - 1)
      return handle(query)
    },
    listAsignadas: async (motorizadoId: string, params?: { estado?: string; limit?: number }): Promise<Result<Solicitud[]>> => {
      let query = supabase.from('solicitudes').select('*').eq('motorizado_id', motorizadoId).order('creado_en', { ascending: false })
      if (params?.estado) query = query.eq('estado', params.estado)
      if (params?.limit) query = query.limit(params.limit)
      return handle(query)
    },
    getById: async (id: string): Promise<Result<Solicitud>> =>
      handle(supabase.from('solicitudes').select('*').eq('id', id).single()),
    aceptar: async (id: string, motorizadoId: string): Promise<Result<Solicitud>> => {
      const hoy = new Date().toISOString()
      return handle(
        supabase.from('solicitudes').update({ estado: 'asignada', motorizado_id: motorizadoId, asignado_en: hoy }).eq('id', id).select().single()
      )
    },
    updateEstado: async (id: string, estado: string): Promise<Result<Solicitud>> => {
      const updates: Record<string, any> = { estado }
      if (estado === 'completado' || estado === 'entregada') updates.completado_en = new Date().toISOString()
      return handle(supabase.from('solicitudes').update(updates).eq('id', id).select().single())
    },
    rechazar: async (id: string): Promise<Result<Solicitud>> => {
      return handle(supabase.from('solicitudes').update({ motorizado_id: null, estado: 'pendiente', asignado_en: null }).eq('id', id).select().single())
    },
  },

  ganancias: {
    list: async (motorizadoId: string, params?: { pagada?: boolean; limit?: number }): Promise<Result<Ganancium[]>> => {
      let query = supabase.from('ganancias').select('*').eq('motorizado_id', motorizadoId).order('created_at', { ascending: false })
      if (params?.pagada !== undefined) query = query.eq('pagada', params.pagada)
      if (params?.limit) query = query.limit(params.limit)
      return handle(query)
    },
    resumen: async (motorizadoId: string): Promise<Result<{ total: number; pendiente: number; pagada: number }>> => {
      const { data, error } = await supabase.from('ganancias').select('monto, pagada').eq('motorizado_id', motorizadoId)
      if (error) return { data: null, error: new Error(error.message) }
      const total = data.reduce((s, g) => s + Number(g.monto), 0)
      const pagada = data.filter(g => g.pagada).reduce((s, g) => s + Number(g.monto), 0)
      return { data: { total, pendiente: total - pagada, pagada }, error: null }
    },
  },

  notificaciones: {
    list: async (userId: string, params?: { leida?: boolean; limit?: number }): Promise<Result<Notificacion[]>> => {
      let query = supabase.from('notificaciones').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      if (params?.leida !== undefined) query = query.eq('leida', params.leida)
      if (params?.limit) query = query.limit(params.limit)
      return handle(query)
    },
    marcarLeida: (id: string): Promise<Result<Notificacion>> =>
      handle(supabase.from('notificaciones').update({ leida: true }).eq('id', id).select().single()),
  },

  realtime: {
    onSolicitudesDisponibles: (callback: (payload: any) => void) =>
      supabase.channel('solicitudes-disponibles')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes', filter: 'estado=eq.confirmada' }, callback)
        .subscribe(),
    onSolicitudesAsignadas: (motorizadoId: string, callback: (payload: any) => void) =>
      supabase.channel(`solicitudes:${motorizadoId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes', filter: `motorizado_id=eq.${motorizadoId}` }, callback)
        .subscribe(),
    removeChannel: (channel: any) => supabase.removeChannel(channel),
  },
}

export default api
