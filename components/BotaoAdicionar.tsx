'use client'

import { useCart } from '@/lib/store'
import { useState } from 'react'

export default function BotaoAdicionar({ produto }: { produto: any }) {
  const adicionarAoCarrinho = useCart((state) => state.adicionarAoCarrinho)
  const [adicionado, setAdicionado] = useState(false)

  const handleAdicionar = () => {
    adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.fotos && produto.fotos.length > 0 ? produto.fotos[0] : '', 
      quantidade: 1
    })
    
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  return (
    <button 
      onClick={handleAdicionar}
      disabled={adicionado}
      className={`w-full font-bold py-4 rounded transition-all duration-300 uppercase tracking-widest ${
        adicionado 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-hb-gold text-hb-black hover:bg-hb-goldLight'
      }`}
    >
      {adicionado ? 'Adicionado à Sacola!' : 'Adicionar à Sacola'}
    </button>
  )
}