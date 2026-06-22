import { createClient } from '@supabase/supabase-js'
import { extra } from '@/lib/config'

export const supabase = createClient(extra.supabaseUrl, extra.supabaseAnonKey)
