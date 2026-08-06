import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BotaoAdicionar from '@/components/BotaoAdicionar'
import BotaoFavorito from '@/components/BotaoFavorito'
import CalculadorFrete from '@/components/CalculadorFrete'
import Avaliacoes from '@/components/Avaliacoes'
import ZoomImagem from '@/components/ZoomImagem'
import ContadorVisitas from '@/components/ContadorVisitas' 
import { Play } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PaginaProduto({ params }: PageProps) {
  const { slug } = await params

  const { data: produto } = await supabase
    .from('produtos')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!produto) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-hb-black relative">
      <ContadorVisitas slug={slug} />

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          
          {/* LADO ESQUERDO: GALERIA DE MÍDIA */}
          <div className="space-y-4">
            <div>
              {produto.fotos && produto.fotos.length > 0 ? (
                <ZoomImagem 
                  src={produto.fotos[0]} 
                  alt={produto.nome} 
                  material={produto.material} 
                />
              ) : (
                <div className="bg-hb-gray rounded-2xl aspect-[4/5] flex items-center justify-center border border-gray-800 text-gray-500 italic">
                  Sem imagem disponível
                </div>
              )}
            </div>

            {produto.video_url && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Play size={16} className="text-hb-gold" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-hb-gold">Veja em Detalhes</h3>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] md:aspect-video max-h-[500px] border border-gray-800 shadow-lg">
                  <video 
                    src={produto.video_url}
                    controls loop muted autoPlay playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <p className="text-[8px] text-white font-bold uppercase tracking-widest">Vídeo Real</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LADO DIREITO: DETALHES */}
          <div className="flex flex-col justify-center">
            <span className="text-sm text-gray-500 uppercase tracking-[0.3em] mb-2 font-medium">HB Importados</span>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-light text-white uppercase tracking-tight">{produto.nome}</h1>
              <div className="flex-shrink-0 mt-1">
                <BotaoFavorito produto={produto} />
              </div>
            </div>
            
            <div className="text-3xl font-bold text-hb-gold mb-6">
              R$ {Number(produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            <div className="border-t border-gray-800 py-6 mb-8 space-y-4">
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Descrição</h3>
                <p className="text-gray-400 leading-relaxed text-sm font-light">
                  {produto.descricao || 'Nenhuma descrição disponível para este item exclusivo.'}
                </p>
              </div>
              
              {produto.material && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Composição</h3>
                  <p className="text-sm font-medium text-white">{produto.material}</p>
                </div>
              )}

              <div className="pt-2">
                <Link href="/cuidados" className="text-[10px] uppercase font-bold tracking-widest underline text-hb-gold hover:text-hb-goldLight transition">
                  Ver guia de cuidados e garantia
                </Link>
              </div>
            </div>

            <BotaoAdicionar produto={produto} />

            <div className="mt-6">
              <CalculadorFrete />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-center border-t border-gray-800 pt-8">
              <div className="p-4 bg-hb-gray rounded-xl border border-gray-800">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Qualidade</p>
                <p className="text-[11px] font-black text-white mt-1 uppercase">Garantia Vitalícia</p>
              </div>
              <div className="p-4 bg-hb-gray rounded-xl border border-gray-800">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Pagamento</p>
                <p className="text-[11px] font-black text-white mt-1 uppercase">Pix ou 10x s/ juros</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto border-t border-gray-800 pt-16">
          <Avaliacoes produtoId={produto.id} />
        </div>
      </div>
    </main>
  )
}