'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function Avaliacoes({ produtoId }: { produtoId: string }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<any[]>([])
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('produto_id', produtoId)
        .order('created_at', { ascending: false })
      setReviews(data || [])
    }
    carregar()
  }, [produtoId])

  const enviarReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return alert("Faça login para avaliar!")
    setEnviando(true)

    const nomeUsuario = session?.user?.name || 'Cliente Verificado'

    const { error } = await supabase.from('avaliacoes').insert({
      produto_id: produtoId,
      usuario_nome: nomeUsuario,
      nota: nota,
      comentario: comentario
    })

    if (error) {
      alert(`Erro ao salvar no banco: ${error.message}`)
      console.error(error)
    } else {
      setComentario('')
      alert("Avaliação publicada com sucesso!")
      window.location.reload()
    }
    setEnviando(false)
  }

  return (
    <div className="mt-16 border-t border-neutral-800 pt-12 text-white">
      <h2 className="text-xl font-light uppercase tracking-widest mb-8">Avaliações de Clientes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Lista de Reviews */}
        <div className="space-y-8">
          {reviews.length === 0 && <p className="text-neutral-500 italic">Este produto ainda não recebeu avaliações.</p>}
          {reviews.map((r, i) => (
            <div key={i} className="border-b border-neutral-800 pb-6">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    size={12} 
                    fill={index < r.nota ? "currentColor" : "none"} 
                    className={index < r.nota ? "text-hb-gold" : "text-neutral-700"} 
                  />
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-200">{r.usuario_nome}</p>
              <p className="text-sm text-neutral-400 mt-2 italic leading-relaxed">"{r.comentario}"</p>
            </div>
          ))}
        </div>

        {/* Formulário (Apenas logado) */}
        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
          <h3 className="text-sm font-bold uppercase mb-6 tracking-widest text-white">Deixe sua opinião</h3>
          {session ? (
            <form onSubmit={enviarReview} className="space-y-6">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2 font-bold">Sua Nota</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setNota(n)} className="hover:scale-110 transition">
                      <Star 
                        size={24} 
                        fill={n <= nota ? "currentColor" : "none"} 
                        className={n <= nota ? "text-hb-gold" : "text-neutral-700"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2 font-bold">Seu Comentário</p>
                <textarea 
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="O que você achou da qualidade da joia?"
                  className="w-full bg-transparent border border-neutral-700 text-white placeholder-neutral-600 p-4 rounded-xl text-sm h-32 outline-none focus:border-hb-gold resize-none transition"
                  required
                />
              </div>

              <button disabled={enviando} className="w-full bg-hb-gold text-hb-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-hb-goldLight transition disabled:opacity-50">
                {enviando ? <Loader2 className="animate-spin mx-auto text-hb-black" size={18} /> : 'Publicar Avaliação'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-neutral-400 mb-4">Você precisa estar logado para avaliar este produto e compartilhar sua experiência.</p>
              <Link href="/login" className="inline-block border-b border-hb-gold text-hb-gold text-[10px] font-bold uppercase tracking-widest pb-1 hover:text-hb-goldLight transition">
                Fazer Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}