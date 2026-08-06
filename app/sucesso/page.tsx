'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ShoppingBag, ArrowRight, Camera, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/store'

function ConteudoSucesso() {
  const searchParams = useSearchParams()
  const { limparCarrinho } = useCart() as any
  const pedidoId = searchParams.get('external_reference')

  useEffect(() => {
    if (limparCarrinho) limparCarrinho()
  }, [limparCarrinho])

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-hb-black px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-30"></div>
            <div className="bg-green-900/30 p-4 rounded-full relative z-10 border border-green-800">
              <CheckCircle2 size={64} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-light uppercase tracking-widest text-white italic">
            Compra Aprovada
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed px-4 font-light">
            Sua joia exclusiva da <strong className="text-hb-gold font-normal">HB Importados</strong> já está sendo separada e embalada com todo o cuidado. Enviamos os detalhes e o recibo para o seu e-mail.
          </p>
        </div>

        {pedidoId && (
          <div className="bg-gradient-to-r from-hb-gray to-hb-black border border-hb-gold/30 p-5 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-hb-gold uppercase tracking-widest mb-1">Número do Pedido</p>
            <p className="text-xl font-black text-white tracking-widest">#{pedidoId.toUpperCase()}</p>
          </div>
        )}

        <div className="bg-hb-gray border border-gray-800 p-5 rounded-xl flex items-start gap-4 text-left">
          <div className="bg-hb-black border border-gray-700 p-2 rounded-lg shadow-sm">
            <Camera size={20} className="text-hb-gold" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1 mb-1">
              Clube VIP <Sparkles size={12} className="text-hb-gold" />
            </h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Quando sua joia chegar, poste uma foto ou vídeo nos stories marcando <strong className="text-hb-gold">@hbimportados</strong> e ganhe um cupom de <strong className="text-white">10% OFF</strong> para a próxima compra!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link 
            href="/minha-conta" 
            className="w-full bg-hb-gold text-hb-black py-4 font-bold text-xs uppercase tracking-widest hover:bg-hb-goldLight transition flex items-center justify-center gap-2 rounded shadow-md"
          >
            Acompanhar Entrega <ArrowRight size={14} />
          </Link>
          
          <Link 
            href="/" 
            className="w-full bg-transparent border border-gray-700 text-white py-4 font-bold text-xs uppercase tracking-widest hover:border-hb-gold hover:text-hb-gold transition flex items-center justify-center gap-2 rounded"
          >
            <ShoppingBag size={14} /> Continuar Comprando
          </Link>
        </div>

        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
          Dúvidas? Entre em contato pelo nosso WhatsApp.
        </p>
      </div>
    </main>
  )
}

export default function PaginaSucesso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-hb-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-hb-gold rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Verificando pagamento...</p>
      </div>
    }>
      <ConteudoSucesso />
    </Suspense>
  )
}