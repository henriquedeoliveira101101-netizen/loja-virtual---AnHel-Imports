import { createClient } from '@supabase/supabase-js'

// Limpa aspas acidentais, espaços e barras extras ao final da URL
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/["']/g, '').trim().replace(/\/+$/, '')

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseAnonKey = rawKey.replace(/["']/g, '').trim()

// Valida se a URL é válida para evitar o erro "Invalid path"
const finalUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co'

export const supabase = createClient(finalUrl, supabaseAnonKey || 'placeholder')