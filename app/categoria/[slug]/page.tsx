import { supabase } from '@/lib/supabase'
import FiltroCategoria from '../FiltroCategoria'

// Força a página a carregar dados novos
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PaginaCategoria({ params }: PageProps) {
  const { slug } = await params

  // Dicionário de títulos 
  const nomesTitulos: Record<string, string> = {
    'aneis': 'Anéis',
    'colares': 'Colares',
    'pulseiras': 'Pulseiras',
    'relogios': 'Relógios',
    'brincos': 'Brincos',
  }
  const tituloCategoria = nomesTitulos[slug] || slug

  // Busca segura no servidor (nunca dá erro no navegador do cliente)
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria_slug', slug)

  // Retorna a tela interativa passando os produtos para ela
  return (
    <FiltroCategoria 
      produtosOriginais={produtos || []} 
      tituloCategoria={tituloCategoria} 
    />
  )
}