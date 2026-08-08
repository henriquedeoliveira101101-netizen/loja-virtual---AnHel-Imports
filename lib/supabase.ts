import { createClient } from '@supabase/supabase-js'

// Tenta pegar de NEXT_PUBLIC_SUPABASE_URL ou de SUPABASE_URL
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

// Remove aspas, espaços e barras no final
const supabaseUrl = rawUrl.replace(/["']/g, '').trim().replace(/\/+$/, '')
const supabaseAnonKey = rawKey.replace(/["']/g, '').trim()

// Garante que a URL seja válida para o SDK do Supabase não dar erro de "Invalid path"
const finalUrl = supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co'

export const supabase = createClient(
  finalUrl, 
  supabaseAnonKey || 'placeholder-key'
)