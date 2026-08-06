'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, DollarSign, ShoppingBag, Eye, 
  Package, Loader2, ArrowUpRight, Clock, CheckCircle2 
} from 'lucide-react'

export default function AdminDashboard() {
  const [carregando, setCarregando] = useState(true)
  
  const [pedidos, setPedidos] = useState<any[]>([])
  const [produtosPopulares, setProdutosPopulares] = useState<any[]>([])
  const [receitaTotal, setReceitaTotal] = useState(0)
  const [vendasConcluidas, setVendasConcluidas] = useState(0)

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const { data: dadosPedidos, error: erroPedidos } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false })

        if (!erroPedidos && dadosPedidos) {
          setPedidos(dadosPedidos)
          
          const receita = dadosPedidos
            .filter(p => p.status === 'pago' || p.status === 'entregue' || p.status === 'enviado')
            .reduce((acc, pedido) => acc + Number(pedido.total), 0)
          
          const concluidas = dadosPedidos.filter(p => p.status === 'pago' || p.status === 'entregue' || p.status === 'enviado').length

          setReceitaTotal(receita)
          setVendasConcluidas(concluidas)
        }

        const { data: dadosProdutos, error: erroProdutos } = await supabase
          .from('produtos')
          .select('*')
          .order('visitas', { ascending: false })
          .limit(5)

        if (!erroProdutos && dadosProdutos) {
          setProdutosPopulares(dadosProdutos)
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDashboard()
  }, [])

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'entregue' || s === 'pago') return 'bg-green-900/30 text-green-400 border-green-800'
    if (s === 'enviado') return 'bg-blue-900/30 text-blue-400 border-blue-800'
    if (s === 'processando' || s === 'pendente') return 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
    return 'bg-gray-800 text-gray-300 border-gray-700'
  }

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-hb-black"><Loader2 className="animate-spin text-hb-gold" size={40} /></div>
  }

  return (
    <main className="min-h-screen bg-hb-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-white uppercase tracking-widest italic mb-2">Visão Geral</h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">Acompanhe o desempenho da sua loja</p>
          </div>
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sistema Online
          </div>
        </div>

        {/* CARDS DE MÉTRICAS GERAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Receita */}
          <div className="bg-hb-gray p-6 rounded-2xl border border-gray-800 shadow-sm relative overflow-hidden group hover:border-hb-gold transition-colors">
            <div className="absolute -right-6 -top-6 bg-hb-gold/10 w-24 h-24 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-hb-gold/10 text-hb-gold rounded-xl"><DollarSign size={20} /></div>
              <span className="text-[10px] font-bold text-green-400 bg-green-900/30 border border-green-800 px-2 py-1 rounded flex items-center gap-1"><TrendingUp size={12}/> +12%</span>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">Receita Total</h3>
            <p className="text-2xl font-black text-white relative z-10">R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Card Pedidos Fechados */}
          <div className="bg-hb-gray p-6 rounded-2xl border border-gray-800 shadow-sm hover:border-hb-gold transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-800 text-gray-300 rounded-xl"><ShoppingBag size={20} /></div>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vendas Concluídas</h3>
            <p className="text-2xl font-black text-white">{vendasConcluidas}</p>
          </div>

          {/* Card Total de Pedidos */}
          <div className="bg-hb-gray p-6 rounded-2xl border border-gray-800 shadow-sm hover:border-hb-gold transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-800 text-gray-300 rounded-xl"><Package size={20} /></div>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Pedidos Gerados</h3>
            <p className="text-2xl font-black text-white">{pedidos.length}</p>
          </div>

          {/* Card Conversão */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-sm border border-hb-gold/30 text-white hover:border-hb-gold transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-hb-gold/20 text-hb-gold rounded-xl"><CheckCircle2 size={20} /></div>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Taxa de Sucesso</h3>
            <p className="text-2xl font-black text-white">
              {pedidos.length > 0 ? Math.round((vendasConcluidas / pedidos.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* ÁREA INFERIOR: RANKING E ÚLTIMOS PEDIDOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TOP JOIAS (As mais acessadas) */}
          <div className="bg-hb-gray rounded-2xl border border-gray-800 shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Eye size={18} className="text-hb-gold" /> Top Joias Acessadas
              </h2>
            </div>
            <div className="p-6 flex-1">
              {produtosPopulares.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs uppercase tracking-widest">Nenhum produto cadastrado</div>
              ) : (
                <div className="space-y-6">
                  {produtosPopulares.map((produto, index) => (
                    <div key={produto.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={produto.fotos?.[0] || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded object-cover border border-gray-700" />
                          <div className="absolute -top-2 -left-2 w-5 h-5 bg-hb-gold text-hb-black text-[10px] font-bold flex items-center justify-center rounded-full shadow-md">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-200 uppercase line-clamp-1 group-hover:text-hb-gold transition-colors">{produto.nome}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{produto.visitas || 0} visualizações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-white">R$ {Number(produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${produto.estoque > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Esgotado'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ÚLTIMOS PEDIDOS */}
          <div className="lg:col-span-2 bg-hb-gray rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Clock size={18} className="text-hb-gold" /> Últimos Pedidos
              </h2>
              <button className="text-[10px] font-bold text-hb-gold uppercase tracking-widest flex items-center gap-1 hover:text-hb-goldLight transition-colors">
                Ver Todos <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/30 border-b border-gray-800">
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pedido</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cliente</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {pedidos.slice(0, 7).map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 text-xs font-bold text-white">#{String(pedido.id).split('-')[0]}</td>
                      <td className="p-4 text-xs text-gray-300">{pedido.cliente_email || 'Não informado'}</td>
                      <td className="p-4 text-xs text-gray-500">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(pedido.status)}`}>
                          {pedido.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-black text-hb-gold text-right">R$ {Number(pedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-gray-500 uppercase tracking-widest">
                        Nenhum pedido recebido ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}