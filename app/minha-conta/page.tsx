'use client'

import { useSession, signOut } from 'next-auth/react' 
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link' 
import { 
  User, Package, Heart, Loader2, Lock, 
  ShoppingBag, Trash2, LogOut, RefreshCcw, X, Upload, 
  AlertCircle, CheckCircle2, Truck, DollarSign, Sparkles, MapPin, CreditCard, Receipt, Gift
} from 'lucide-react'
import { useCart } from '@/lib/store'
import { supabase } from '@/lib/supabase'

export default function MinhaConta() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregandoPedidos, setCarregandoPedidos] = useState(false)
  const { wishlist, toggleWishlist, adicionarAoCarrinho } = useCart() as any
  
  const [form, setForm] = useState({ cpf_cnpj: '', whatsapp: '', data_nascimento: '' })
  const [endereco, setEndereco] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' })
  
  const [saldoCashback, setSaldoCashback] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false) 

  const [podeEditarCPF, setPodeEditarCPF] = useState(true)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  
  const [carregandoPagamentoId, setCarregandoPagamentoId] = useState<string | null>(null)
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null)

  const [modalAberta, setModalAberta] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState<any>(null)
  const [pedidoIdSelecionado, setPedidoIdSelecionado] = useState('')
  const [motivo, setMotivo] = useState('arrependimento')
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null)
  const [carregandoTroca, setCarregandoTroca] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [erroTroca, setErroTroca] = useState('')

  // 🚨 NOVO: Estado para mostrar erros em vermelho
  const [mostrarErros, setMostrarErros] = useState(false)

  // 🚨 NOVO: Efeito para ler a URL vinda do carrinho
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const aba = urlParams.get('aba')
      const alerta = urlParams.get('alerta')
      
      if (aba) setAbaAtiva(aba)
      if (alerta === 'campos_vazios') setMostrarErros(true)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetch('/api/usuario')
        .then(res => res.json())
        .then(data => {
          setForm({ 
            cpf_cnpj: data.cpf_cnpj || '', 
            whatsapp: data.whatsapp || '', 
            data_nascimento: data.data_nascimento || '' 
          })
          
          if (data && data.saldo_cashback) setSaldoCashback(Number(data.saldo_cashback))
          if (data.cpf_cnpj) setPodeEditarCPF(false)
          
          if (data && data.role === 'admin') {
            setIsAdmin(true)
          }
          
          if (data.endereco) {
            try { 
              const endParsed = JSON.parse(data.endereco)
              setEndereco(endParsed) 
            } catch (e) { 
              setEndereco(prev => ({ ...prev, logradouro: data.endereco })) 
            }
          }
          setCarregando(false)
        })

      setCarregandoPedidos(true)
      fetch('/api/pedidos')
        .then(res => res.json())
        .then(data => {
          setPedidos(Array.isArray(data) ? data : [])
          setCarregandoPedidos(false)
        })
    }
  }, [status, router])

  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, "")
    setEndereco(prev => ({ ...prev, cep: valor }))
    if (cepLimpo.length === 8) {
      setBuscandoCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setEndereco(prev => ({ ...prev, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }))
        }
      } finally {
        setBuscandoCep(false)
      }
    }
  }

  const handleSalvar = async (e: any) => {
    e.preventDefault()
    
    // Se estiver no modo de erro, valida tudo antes de salvar
    if (mostrarErros) {
      if (!form.cpf_cnpj || !form.whatsapp || !endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro) {
        alert("Por favor, preencha todos os campos obrigatórios.")
        return
      }
    }

    setSalvando(true)
    try {
      await fetch('/api/usuario', { method: 'POST', body: JSON.stringify({ ...form, endereco: JSON.stringify(endereco) }) })
      if (form.cpf_cnpj) setPodeEditarCPF(false)
      
      alert("Perfil atualizado com sucesso!")
      
      // Se ele veio do carrinho e completou os dados, manda ele de volta pro carrinho!
      if (mostrarErros) {
        router.push('/carrinho')
      }
      
    } catch (error) {
      alert("Erro ao salvar dados.")
    } finally {
      setSalvando(false)
    }
  }

  const pagarPedidoPendente = async (pedidoId: string) => {
    setCarregandoPagamentoId(pedidoId)
    try {
      const res = await fetch('/api/pedidos/pagar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pedidoId })
      })
      const dados = await res.json()
      if (!res.ok) throw new Error(dados.error || "Erro ao gerar link de pagamento")
      if (dados.urlPagamento) window.location.href = dados.urlPagamento
    } catch (error: any) {
      alert(error.message || "Erro ao abrir o pagamento.")
    } finally {
      setCarregandoPagamentoId(null)
    }
  }

  const getStatusFormatado = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'pendente') return { titulo: 'AGUARDANDO PAGAMENTO', cor: 'text-yellow-500' }
    if (s === 'pago' || s === 'confirmado') return { titulo: 'PREPARANDO PEDIDO', cor: 'text-green-400' }
    if (s === 'enviado') return { titulo: 'PEDIDO ENVIADO', cor: 'text-blue-400' }
    if (s === 'entregue') return { titulo: 'PEDIDO ENTREGUE', cor: 'text-hb-gold' }
    return { titulo: status?.toUpperCase(), cor: 'text-gray-300' }
  }

  const getProgressoStepper = (status: string) => {
    const s = status?.toLowerCase()
    let nivel = 1
    if (s === 'pago' || s === 'confirmado') nivel = 3
    if (s === 'enviado') nivel = 4
    if (s === 'entregue') nivel = 5
    return nivel
  }

  const toggleDetalhes = (id: string) => {
    setPedidoExpandido(prev => prev === id ? null : id)
  }

  const abrirModalTroca = (pedidoId: string, item: any) => {
    setPedidoIdSelecionado(pedidoId); setItemSelecionado(item); setMotivo('arrependimento');
    setFotoArquivo(null); setMensagemSucesso(''); setErroTroca(''); setModalAberta(true);
  }

  const enviarSolicitacaoTroca = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoTroca(true); setErroTroca('')

    if (motivo === 'defeito' && !fotoArquivo) {
      setErroTroca('Para defeitos de fábrica, é obrigatório enviar uma foto.')
      setCarregandoTroca(false)
      return
    }

    try {
      let urlFoto = null
      if (fotoArquivo) {
        const extensao = fotoArquivo.name.split('.').pop()
        const nomeArquivo = `trocas/${Math.random().toString(36).substring(2)}-${Date.now()}.${extensao}`
        const { error: uploadError } = await supabase.storage.from('joias').upload(nomeArquivo, fotoArquivo)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage.from('joias').getPublicUrl(nomeArquivo)
        urlFoto = publicUrlData.publicUrl
      }

      const response = await fetch('/api/trocas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: pedidoIdSelecionado, produtoId: null, usuarioId: null, motivo, fotoUrl: urlFoto, precoProduto: itemSelecionado.preco || 0 })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setMensagemSucesso(data.mensagem)
      setTimeout(() => { setModalAberta(false); setMensagemSucesso(''); }, 5000)
    } catch (err: any) {
      setErroTroca('Ocorreu um erro ao processar sua solicitação.')
    } finally {
      setCarregandoTroca(false)
    }
  }

  if (status === 'loading' || carregando) return <div className="min-h-[70vh] bg-hb-black flex items-center justify-center"><Loader2 className="animate-spin text-hb-gold" size={32} /></div>

  return (
    <main className="min-h-screen bg-hb-black text-gray-300 pb-20">
      
      {/* HEADER LUXO */}
      <div className="bg-gray-950 border-b border-gray-900 py-8 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light text-white uppercase tracking-widest italic">Minha Conta</h1>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-400 transition">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
        {/* MENU LATERAL */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1 sticky top-24">
            <button onClick={() => setAbaAtiva('dados')} className={`flex items-center gap-3 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition border-b border-gray-900 ${abaAtiva === 'dados' ? 'text-hb-gold bg-gray-900/50 border-l-2 border-l-hb-gold' : 'text-gray-500 hover:text-white hover:bg-gray-900/30'}`}><User size={16} /> Meus Dados</button>
            <button onClick={() => setAbaAtiva('pedidos')} className={`flex items-center gap-3 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition border-b border-gray-900 ${abaAtiva === 'pedidos' ? 'text-hb-gold bg-gray-900/50 border-l-2 border-l-hb-gold' : 'text-gray-500 hover:text-white hover:bg-gray-900/30'}`}><Package size={16} /> Meus Pedidos</button>
            <button onClick={() => setAbaAtiva('trocas')} className={`flex items-center gap-3 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition border-b border-gray-900 ${abaAtiva === 'trocas' ? 'text-hb-gold bg-gray-900/50 border-l-2 border-l-hb-gold' : 'text-gray-500 hover:text-white hover:bg-gray-900/30'}`}><RefreshCcw size={16} /> Trocas e Devoluções</button>
            <button onClick={() => setAbaAtiva('desejos')} className={`flex items-center gap-3 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition ${abaAtiva === 'desejos' ? 'text-hb-gold bg-gray-900/50 border-l-2 border-l-hb-gold' : 'text-gray-500 hover:text-white hover:bg-gray-900/30'}`}><Heart size={16} /> Lista de Desejos</button>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-4 text-[11px] font-black uppercase tracking-widest text-black bg-hb-gold hover:bg-yellow-600 transition-all mt-6 rounded border border-hb-gold shadow-md"
              >
                <Lock size={16} /> Painel Administrativo
              </Link>
            )}
          </nav>
        </aside>

        {/* CONTEÚDO */}
        <section className="flex-1 min-w-0">
          
          {abaAtiva === 'dados' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              
              {/* 🚨 AVISO DE ERRO */}
              {mostrarErros && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg flex items-center gap-3 shadow-md animate-bounce">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest">Atenção: Preencha os campos em vermelho para finalizar sua compra.</p>
                </div>
              )}

              {/* CARTÃO VIP DE CASHBACK */}
              <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white rounded-xl p-8 shadow-2xl border border-gray-800 relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 bg-hb-gold/10 w-40 h-40 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-hb-gold flex items-center gap-1"><Sparkles size={12} /> Cliente VIP HB</p>
                    <h3 className="text-xl font-light tracking-wide text-gray-200">Seu Saldo em Créditos</h3>
                  </div>
                  <div className="p-3 bg-hb-gold/10 text-hb-gold rounded-full"><DollarSign size={20} /></div>
                </div>
                <div className="mt-8 relative z-10">
                  <p className="text-3xl font-black tracking-tight text-white">R$ {saldoCashback.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-2">
                    {saldoCashback > 0 ? '✨ Seus créditos estão disponíveis para sua próxima joia!' : 'Compre joias e acumule 5% de volta para a próxima compra.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSalvar} className="space-y-10">
                <div>
                  <h2 className="text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Nome Completo</label>
                      <input value={session?.user?.name || ''} disabled className="w-full border border-gray-800 p-3 rounded bg-gray-900/50 text-gray-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">E-mail</label>
                      <input value={session?.user?.email || ''} disabled className="w-full border border-gray-800 p-3 rounded bg-gray-900/50 text-gray-500 text-sm" />
                    </div>
                    
                    {/* INPUT CPF COM VALIDAÇÃO */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>CPF / CNPJ {!podeEditarCPF && <Lock size={12} className="inline ml-1"/>}</span>
                        {mostrarErros && !form.cpf_cnpj && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={form.cpf_cnpj} 
                        onChange={(e) => setForm({...form, cpf_cnpj: e.target.value})} 
                        disabled={!podeEditarCPF} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${!podeEditarCPF ? 'bg-gray-900/50 text-gray-500 border-gray-800' : (mostrarErros && !form.cpf_cnpj ? 'border-red-500 bg-red-900/10' : 'border-gray-700')}`} 
                      />
                    </div>
                    
                    {/* INPUT WHATSAPP COM VALIDAÇÃO */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>WhatsApp</span>
                        {mostrarErros && !form.whatsapp && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={form.whatsapp} 
                        onChange={(e) => setForm({...form, whatsapp: e.target.value})} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${mostrarErros && !form.whatsapp ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Endereço de Entrega</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* INPUT CEP COM VALIDAÇÃO */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>CEP</span>
                        {mostrarErros && !endereco.cep && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={endereco.cep} 
                        onChange={(e) => buscarCep(e.target.value)} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${mostrarErros && !endereco.cep ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} 
                        placeholder="00000-000" 
                      />
                      {buscandoCep && <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-hb-gold" />}
                    </div>
                    
                    {/* INPUT RUA COM VALIDAÇÃO */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>Rua</span>
                        {mostrarErros && !endereco.logradouro && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={endereco.logradouro} 
                        onChange={(e) => setEndereco({...endereco, logradouro: e.target.value})} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${mostrarErros && !endereco.logradouro ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} 
                      />
                    </div>
                    
                    {/* INPUT NÚMERO COM VALIDAÇÃO */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>Número</span>
                        {mostrarErros && !endereco.numero && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={endereco.numero} 
                        onChange={(e) => setEndereco({...endereco, numero: e.target.value})} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${mostrarErros && !endereco.numero ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} 
                      />
                    </div>
                    
                    {/* INPUT BAIRRO COM VALIDAÇÃO */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 mb-2 uppercase flex justify-between">
                        <span>Bairro</span>
                        {mostrarErros && !endereco.bairro && <span className="text-red-500">* Obrigatório</span>}
                      </label>
                      <input 
                        value={endereco.bairro} 
                        onChange={(e) => setEndereco({...endereco, bairro: e.target.value})} 
                        className={`w-full border p-3 rounded text-sm bg-transparent text-white focus:outline-none focus:border-hb-gold transition-colors ${mostrarErros && !endereco.bairro ? 'border-red-500 bg-red-900/10' : 'border-gray-700'}`} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Cidade / UF</label>
                      <input 
                        value={`${endereco.cidade} - ${endereco.uf}`} 
                        disabled 
                        className={`w-full border p-3 rounded bg-gray-900/50 text-gray-500 text-sm ${mostrarErros && (!endereco.cidade || !endereco.uf) ? 'border-red-500 border-dashed' : 'border-gray-800'}`} 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={salvando} className="bg-hb-gold text-black px-12 py-4 font-bold uppercase tracking-widest text-xs hover:bg-yellow-600 transition disabled:opacity-50">
                  {salvando ? 'Salvando...' : 'Salvar e Voltar Para Sacola'}
                </button>
              </form>
            </div>
          )}

          {abaAtiva === 'pedidos' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-sm font-bold text-white mb-8 uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Histórico de Compras</h2>
              
              {carregandoPedidos ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
              ) : pedidos.length === 0 ? (
                <div className="text-center py-12 text-gray-500 uppercase text-[10px] font-bold tracking-widest">Nenhum pedido encontrado.</div>
              ) : (
                <div className="space-y-8">
                  {pedidos.map((pedido) => {
                    const statusInfo = getStatusFormatado(pedido.status)
                    const expandido = pedidoExpandido === pedido.id

                    return (
                      <div key={pedido.id} className="border border-gray-800 rounded overflow-hidden">
                        
                        {/* CABEÇALHO DO PEDIDO */}
                        <div className="bg-gray-900/40 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800">
                          <div className="flex flex-wrap gap-8 md:gap-12">
                            <div>
                              <p className="text-[10px] text-gray-500 font-medium mb-1">Data do pedido</p>
                              <p className="text-sm font-medium text-white">{new Date(pedido.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-medium mb-1">Total</p>
                              <p className="text-sm font-medium text-white">R$ {Number(pedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                          <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0">
                            <p className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-widest"># {String(pedido.id).split('-')[0]}</p>
                            <p className={`text-xs font-black uppercase tracking-widest ${statusInfo.cor}`}>{statusInfo.titulo}</p>
                          </div>
                        </div>
                        
                        {/* CORPO DO PEDIDO (ITENS E BOTÕES) */}
                        <div className="p-5 md:p-6 bg-hb-black">
                          {pedido.itens?.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-6 border-b border-gray-800 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                              <img src={item.foto} className="w-24 h-24 object-cover border border-gray-800" />
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-white uppercase tracking-wide leading-relaxed">{item.nome}</h3>
                                <p className="text-xs text-gray-400 mt-2">{item.quantidade} un - R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-hb-gold mt-3 flex items-center gap-1"><Gift size={12} /> Joia Exclusiva HB</p>
                              </div>
                              <div className="w-full md:w-48 shrink-0 flex flex-col gap-3">
                                <button 
                                  onClick={() => adicionarAoCarrinho(item)} 
                                  className="w-full border border-hb-gold text-hb-gold text-[9px] font-black uppercase tracking-widest py-3 hover:bg-hb-gold hover:text-black transition"
                                >
                                  Pedir Novamente
                                </button>
                                
                                {pedido.status?.toLowerCase() === 'pendente' && (
                                  <button 
                                    onClick={() => pagarPedidoPendente(pedido.id)}
                                    disabled={carregandoPagamentoId === pedido.id}
                                    className="w-full bg-hb-gold text-black text-[9px] font-black uppercase tracking-widest py-3 hover:bg-yellow-600 transition flex justify-center items-center gap-2"
                                  >
                                    {carregandoPagamentoId === pedido.id ? <Loader2 size={12} className="animate-spin" /> : 'Pagar Agora'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="pt-4 flex justify-end">
                            <button 
                              onClick={() => toggleDetalhes(pedido.id)} 
                              className="w-full md:w-56 bg-gray-800 text-white text-[9px] font-black uppercase tracking-widest py-4 hover:bg-gray-700 transition shadow-sm"
                            >
                              {expandido ? 'Ocultar Detalhes' : 'Ver Detalhes do Pedido'}
                            </button>
                          </div>
                        </div>

                        {/* DETALHES EXPANSÍVEIS */}
                        {expandido && (
                          <div className="bg-gray-900/50 p-6 md:p-8 border-t border-gray-800 animate-in slide-in-from-top-2">
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-800 pb-8 mb-8">
                              <div>
                                <h4 className="text-sm font-light text-white uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={16} className="text-gray-500" /> Endereço</h4>
                                <p className="text-xs text-white font-bold mb-1">{endereco.logradouro || 'Endereço cadastrado'}</p>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {endereco.numero && `Número: ${endereco.numero}`} <br/>
                                  {endereco.bairro && `Bairro: ${endereco.bairro}`} <br/>
                                  {endereco.cidade && `${endereco.cidade} - ${endereco.uf}`} <br/>
                                  {endereco.cep}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-light text-white uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={16} className="text-gray-500" /> Pagamento</h4>
                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                  <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-[10px] font-bold border border-blue-800">Mercado Pago</span>
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-light text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Receipt size={16} className="text-gray-500" /> Resumo</h4>
                                <div className="space-y-2 text-xs text-gray-400">
                                  <div className="flex justify-between"><span>Subtotal</span><span>R$ {Number(pedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                  <div className="flex justify-between font-bold text-white pt-2 mt-2 border-t border-gray-800"><span>Total</span><span>R$ {Number(pedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                                </div>
                              </div>
                            </div>

                            {/* LINHA DO TEMPO (STEPPER) */}
                            <div>
                              <h4 className="text-sm font-light text-white uppercase tracking-widest mb-8">Status do Pedido</h4>
                              <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-800 z-0"></div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-hb-gold z-0 transition-all duration-1000" style={{ width: `${(getProgressoStepper(pedido.status) - 1) * 25}%` }}></div>
                                
                                {/* Passo 1 */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-hb-black ${getProgressoStepper(pedido.status) >= 1 ? 'border-hb-gold text-hb-gold' : 'border-gray-700 text-gray-700'}`}><CheckCircle2 size={16} /></div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-20 ${getProgressoStepper(pedido.status) >= 1 ? 'text-white' : 'text-gray-600'}`}>Pedido Realizado</span>
                                </div>
                                {/* Passo 2 */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-hb-black ${getProgressoStepper(pedido.status) >= 3 ? 'border-hb-gold text-hb-gold' : 'border-gray-700 text-gray-700'}`}><CheckCircle2 size={16} /></div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-20 ${getProgressoStepper(pedido.status) >= 3 ? 'text-white' : 'text-gray-600'}`}>Pagamento Aprovado</span>
                                </div>
                                {/* Passo 3 */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-hb-black ${getProgressoStepper(pedido.status) >= 3 ? 'border-hb-gold text-hb-gold' : 'border-gray-700 text-gray-700'}`}><Package size={16} /></div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-20 ${getProgressoStepper(pedido.status) >= 3 ? 'text-white' : 'text-gray-600'}`}>Preparando Pedido</span>
                                </div>
                                {/* Passo 4 */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-hb-black ${getProgressoStepper(pedido.status) >= 4 ? 'border-hb-gold text-hb-gold' : 'border-gray-700 text-gray-700'}`}><Truck size={16} /></div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-20 ${getProgressoStepper(pedido.status) >= 4 ? 'text-white' : 'text-gray-600'}`}>Pedido Enviado</span>
                                </div>
                                {/* Passo 5 */}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-hb-black ${getProgressoStepper(pedido.status) >= 5 ? 'border-hb-gold text-hb-gold' : 'border-gray-700 text-gray-700'}`}><MapPin size={16} /></div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest text-center w-20 ${getProgressoStepper(pedido.status) >= 5 ? 'text-white' : 'text-gray-600'}`}>Entregue</span>
                                </div>
                              </div>
                            </div>
                            
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'trocas' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-sm font-bold text-white mb-8 uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Solicitar Troca ou Devolução</h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Você pode solicitar a troca de itens <span className="font-bold text-white">Entregues</span> em até 7 dias corridos após o recebimento (Arrependimento) ou para defeitos de fábrica.
                </p>
              </div>
              
              {carregandoPedidos ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
              ) : pedidos.filter(p => p.status?.toLowerCase() === 'entregue').length === 0 ? (
                <div className="text-center py-12 text-gray-500 uppercase text-[10px] font-bold tracking-widest">Nenhum pedido entregue disponível para troca.</div>
              ) : (
                <div className="space-y-6">
                  {pedidos.filter(p => p.status?.toLowerCase() === 'entregue').map((pedido) => (
                    <div key={`troca-${pedido.id}`} className="border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-900/80 p-4 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Pedido Entregue</p>
                          <p className="text-xs font-bold text-white">#{pedido.id}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="space-y-4">
                          {pedido.itens?.map((item: any, idx: number) => (
                            <div key={`troca-item-${idx}`} className="flex items-center gap-4 border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                              <img src={item.foto} className="w-12 h-12 object-cover rounded border border-gray-800" />
                              <div className="flex-1"><p className="text-xs font-bold text-gray-200 uppercase tracking-tight">{item.nome}</p></div>
                              <button onClick={() => abrirModalTroca(pedido.id, item)} className="text-[9px] font-bold uppercase border border-hb-gold bg-transparent text-hb-gold px-4 py-2 rounded hover:bg-hb-gold hover:text-black transition flex items-center gap-2">
                                <RefreshCcw size={12} /> Solicitar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'desejos' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-sm font-bold text-white mb-8 uppercase tracking-[0.2em] border-b border-gray-800 pb-4">Minha Lista de Desejos</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-12"><Heart size={48} className="mx-auto text-gray-800 mb-4" /><p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Sua lista está vazia.</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlist.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-800 rounded-xl hover:border-gray-700 transition">
                      <img src={item.foto} className="w-20 h-20 object-cover rounded-lg border border-gray-800" />
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">{item.nome}</h3>
                          <p className="text-sm font-black text-gray-300 mt-1">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => adicionarAoCarrinho(item)} className="flex-1 bg-hb-gold text-black text-[9px] font-black py-2 rounded uppercase flex items-center justify-center gap-1 hover:bg-yellow-600 transition"><ShoppingBag size={12} /> Comprar</button>
                          <button onClick={() => toggleWishlist(item)} className="p-2 text-gray-500 hover:text-red-500 transition"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* --- MODAL DE TROCA --- */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setModalAberta(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition"><X size={20} /></button>
            <h2 className="text-lg font-light uppercase tracking-widest text-white mb-6 flex items-center gap-2"><RefreshCcw size={20} className="text-hb-gold" /> Solicitar Troca</h2>
            {mensagemSucesso ? (
              <div className="bg-green-900/20 text-green-400 p-6 rounded-xl border border-green-900/50 text-center space-y-4"><CheckCircle2 size={40} className="mx-auto" /><p className="text-sm font-medium">{mensagemSucesso}</p></div>
            ) : (
              <form onSubmit={enviarSolicitacaoTroca} className="space-y-6">
                {erroTroca && <div className="p-3 bg-red-900/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-2 border border-red-900/50"><AlertCircle size={14} /> {erroTroca}</div>}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Item</p>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded border border-gray-800">
                    <img src={itemSelecionado?.foto} className="w-10 h-10 object-cover rounded border border-gray-700" />
                    <p className="text-xs font-bold text-white uppercase truncate">{itemSelecionado?.nome}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Motivo</label>
                  <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full bg-gray-900 border border-gray-800 text-white p-3 rounded text-sm outline-none focus:border-hb-gold">
                    <option value="arrependimento">Arrependimento (7 dias)</option>
                    <option value="defeito">Defeito de Fabricação</option>
                    <option value="tamanho">Tamanho Incorreto</option>
                  </select>
                </div>
                {motivo === 'defeito' && (
                  <div className="animate-in fade-in duration-300">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2"><Upload size={14} /> Foto do Defeito (Obrigatório)</label>
                    <input type="file" accept="image/*" required onChange={(e) => setFotoArquivo(e.target.files?.[0] || null)} className="w-full text-xs text-gray-400 border border-gray-800 p-2 bg-gray-900" />
                  </div>
                )}
                <button type="submit" disabled={carregandoTroca} className="w-full bg-hb-gold text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {carregandoTroca ? <Loader2 size={16} className="animate-spin" /> : 'ENVIAR SOLICITAÇÃO'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}