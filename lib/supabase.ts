import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Session = {
  id: string
  nombre: string
  empresa: string
  email: string
  created_at: string
  completed_at: string | null
  datos: Record<string, unknown>
  indicadores: Record<string, unknown>
}
