import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { api, Perfil } from '@/lib/api'

interface AuthCtx {
  token: string | null
  user: any | null
  perfil: Perfil | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nombre: string, telefono: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token)
        setUser(session.user)
        loadPerfil(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token)
        setUser(session.user)
        loadPerfil(session.user.id)
      } else {
        setToken(null)
        setUser(null)
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadPerfil = async (userId: string) => {
    try {
      const r = await api.perfil.get()
      if (r.data) setPerfil(r.data)
    } catch {
      setPerfil(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    setToken(data.session.access_token)
    setUser(data.user)
    await loadPerfil(data.user.id)
  }

  const register = async (email: string, password: string, nombre: string, telefono: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('No se pudo crear la cuenta')

    await supabase.from('perfiles').upsert({
      id: data.user.id,
      email,
      nombre_completo: nombre,
      telefono,
      rol: 'motorizado',
    })

    const tk = data.session?.access_token ?? ''
    if (tk) {
      setToken(tk)
      setUser(data.user)
      await loadPerfil(data.user.id)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setToken(null)
    setUser(null)
    setPerfil(null)
  }

  return (
    <Ctx.Provider value={{ token, user, perfil, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}
