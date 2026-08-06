'use client'

import { useCart } from '@/lib/store'
import Link from 'next/link'
import { Trash2, Loader2, Ticket, CheckCircle2, X, Truck, Sparkles, Plus, Gift, AlertCircle, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react' 
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabase'

export default function PaginaCarrinho() {
  const router = useRouter()
  const { data: session } = useSession() 
  
  // 1. ESTADOS (HOOKS)
  const { itens, cupom, adicionarAoCarrinho, removerDoCarrinho, atualizarQuantidade, limparCarrinho, aplicarCupom, removerCupom } = useCart() as any
  
  const [inputCupom, setInputCupom] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [validandoCupom, setValidandoCupom] = useState(false)

  const [cep, setCep] = useState('')
  const [opcoesFrete, setOpcoesFrete] = useState<any[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<number>(0)
  const [carregandoFrete, setCarregandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState('')
  
  const [embalagemPresente, setEmbalagemPresente] = useState(false)

  const [mostrarPopUpSaida, setMostrarPopUpSaida] = useState(false)
  const [popUpJaMostrado, setPopUpJaMostrado] = useState(false)
  const [produtoBump, setProdutoBump] = useState<any>(null)
  
  const [elegivelBoasVindas, setElegivelBoasVindas] = useState(false)
  const [saldoCashback, setSaldoCashback] = useState(0)
  const [usarCashback, setUsarCashback] = useState(false)

  // 🚨 NOVO ESTADO: Trava de segurança para dados do cliente
  const [perfilCompleto, setPerfilCompleto] = useState(true) // Começa como true para não travar antes de carregar

  // 2. CÁLCULOS GERAIS
  const subtotal = itens.reduce((acc: any, item: any) => acc + (item.preco * item.quantidade), 0)
  const freteGratis = subtotal >= 100 
  const freteFinal = freteGratis ? 0 : freteSelecionado
  const valorDesconto = cupom ? (subtotal * (cupom.desconto / 100)) : 0
  const valorEmbalagem = embalagemPresente ? 15.00 : 0
  
  const subtotalComDesconto = subtotal + freteFinal + valorEmbalagem - valorDesconto
  const valorCashbackAplicado = usarCashback ? Math.min(saldoCashback, subtotalComDesconto) : 0
  const totalGeral = subtotalComDesconto - valorCashbackAplicado

  const descontoAtual = cupom ? cupom.desconto : 0
  const novoDescontoRetencao = descontoAtual + 5
  const codigoRetencao = cupom ? `OFERTA${novoDescontoRetencao}` : 'NAOVAEMBORA'

  // 3. EFEITOS (USE_EFFECTS)
  useEffect(() => {
    removerCupom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function carregarDadosUsuario() {
      if (!session?.user?.email) return

      try {
        const { data: usuarioDb } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (usuarioDb) {
          // Carrega cashback
          if (usuarioDb.saldo_cashback) {
            setSaldoCashback(Number(usuarioDb.saldo_cashback))
          }

          // 🚨 CORREÇÃO DA VERIFICAÇÃO DE SEGURANÇA: 
          // Agora ele lê as colunas exatamente com os nomes corretos do banco de dados
          const temDocumento = Boolean(usuarioDb.cpf_cnpj && usuarioDb.whatsapp)
          
          let temEndereco = false
          if (usuarioDb.endereco) {
            try {
              // Como o endereço é salvo como um JSON, precisamos descompactar para ler
              const endParsed = JSON.parse(usuarioDb.endereco)
              temEndereco = Boolean(endParsed.cep && endParsed.logradouro && endParsed.numero && endParsed.bairro)
            } catch (e) {
              // Fallback de segurança
              temEndereco = usuarioDb.endereco.length > 10
            }
          }
          
          // Só libera se tiver documento e endereço válidos
          setPerfilCompleto(temEndereco && temDocumento)
        }

        // Verifica compras anteriores para o bônus de boas vindas
        const { data: pedidos } = await supabase
          .from('pedidos')
          .select('id')
          .eq('cliente_email', session.user.email)

        if (pedidos && pedidos.length > 0) return 

        if (usuarioDb && usuarioDb.created_at) {
          const diasDeConta = (new Date().getTime() - new Date(usuarioDb.created_at).getTime()) / (1000 * 3600 * 24)
          if (diasDeConta <= 7) {
            setElegivelBoasVindas(true)
          }
        } else {
          setElegivelBoasVindas(true)
        }
      } catch (e) {
        console.error("Erro ao buscar dados do usuário", e)
      }
    }
    carregarDadosUsuario()
  }, [session])

  useEffect(() => {
    async function buscarSugestaoDaLoja() {
      try {
        const { data, error } = await supabase.from('produtos').select('*').limit(10)
        if (!error && data && data.length > 0) {
          const idsNoCarrinho = itens.map((i: any) => i.id)
          const produtosDisponiveis = data.filter(p => !idsNoCarrinho.includes(p.id))

          if (produtosDisponiveis.length > 0) {
            const sorteado = produtosDisponiveis[Math.floor(Math.random() * produtosDisponiveis.length)]
            setProdutoBump({
              id: sorteado.id,
              nome: sorteado.nome,
              foto: sorteado.fotos?.[0] || 'https://via.placeholder.com/200',
              preco_original: Number(sorteado.preco),
              preco: Number(sorteado.preco) * 0.80, 
              quantidade: 1
            })
          } else {
            setProdutoBump(null)
          }
        }
      } catch (err) {
        console.error("Erro ao buscar sugestão", err)
      }
    }
    if (itens.length > 0) {
      buscarSugestaoDaLoja()
    }
  }, [itens])

  useEffect(() => {
    let timerPopUp: NodeJS.Timeout

    const rastrearSaida = (e: MouseEvent) => {
      if (e.clientY <= 10 && !popUpJaMostrado && itens.length > 0) {
        timerPopUp = setTimeout(() => {
          setMostrarPopUpSaida(true)
          setPopUpJaMostrado(true)
        }, 1000)
      }
    }

    const cancelarSaida = () => {
      if (timerPopUp) clearTimeout(timerPopUp)
    }

    const delayInicial = setTimeout(() => {
      document.addEventListener('mouseleave', rastrearSaida)
      document.addEventListener('mouseenter', cancelarSaida)
    }, 5000)

    return () => {
      clearTimeout(delayInicial)
      if (timerPopUp) clearTimeout(timerPopUp)
      document.removeEventListener('mouseleave', rastrearSaida)
      document.removeEventListener('mouseenter', cancelarSaida)
    }
  }, [popUpJaMostrado, itens.length])

  useEffect(() => {
    const emailDoCliente = session?.user?.email
    if (emailDoCliente) {
      const timeoutId = setTimeout(() => {
        fetch('/api/carrinho/salvar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailDoCliente,
            itens: itens,
            total: subtotal
          })
        }).catch(err => console.error("Falha ao salvar carrinho", err))
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [itens, session, subtotal])

  // 4. FUNÇÕES DE AÇÃO
  const aplicarDescontoRetencao = () => {
    aplicarCupom(codigoRetencao, novoDescontoRetencao)
    setMostrarPopUpSaida(false)
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, '$1-$2')
    setCep(value)
  }

  const calcularFrete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cep.length < 9) return

    setCarregandoFrete(true)
    setErroFrete('')
    setOpcoesFrete([])
    setFreteSelecionado(0) 

    try {
      const response = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cep })
      })
      const data = await response.json()

      if (!response.ok) {
        setErroFrete(data.error || 'Erro ao calcular frete.')
      } else {
        const opcoesOrdenadas = data.opcoes.sort((a: any, b: any) => Number(a.preco) - Number(b.preco))
        setOpcoesFrete(opcoesOrdenadas)
        if (opcoesOrdenadas.length > 0) {
          setFreteSelecionado(Number(opcoesOrdenadas[0].preco))
        }
      }
    } catch (err) {
      setErroFrete('Erro de conexão ao calcular frete.')
    } finally {
      setCarregandoFrete(false)
    }
  }

  const validarCupom = async () => {
    const codigo = inputCupom.toUpperCase().trim()
    if (!codigo) return

    setValidandoCupom(true)

    if (codigo === 'BEMVINDO10' && !elegivelBoasVindas) {
      alert("Este cupom é exclusivo para contas criadas há menos de 7 dias em sua primeira compra.")
      setValidandoCupom(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', codigo)
        .eq('ativo', true)
        .single()

      if (error || !data) {
        if (codigo.startsWith('OFERTA') || codigo === 'NAOVAEMBORA') {
          const descontoExtraido = parseInt(codigo.replace(/\D/g, '')) || 5
          aplicarCupom(codigo, descontoExtraido)
          setInputCupom('')
        } else if (codigo === 'BEMVINDO10' && elegivelBoasVindas) {
          aplicarCupom(codigo, 10)
          setInputCupom('')
        } else {
          alert("Cupom inválido ou expirado.")
        }
      } else {
        aplicarCupom(data.codigo, data.desconto)
        setInputCupom('')
      }
    } catch (err) {
      alert("Erro ao verificar cupom. Tente novamente.")
    } finally {
      setValidandoCupom(false)
    }
  }

  const finalizarCompra = async () => {
    if (!session) { router.push('/login'); return; }

    // 🚨 O BLOQUEIO: Se o perfil estiver incompleto, manda ele para Minha Conta
    if (!perfilCompleto) {
      alert("Quase lá! Para podermos enviar suas joias, precisamos do seu Endereço e CPF.\n\nVamos te redirecionar para você preencher os dados.")
      router.push('/minha-conta?aba=dados&alerta=campos_vazios')
      return;
    }

    if (freteFinal === 0 && !freteGratis) { alert("Por favor, calcule e selecione um frete para a entrega."); return; }

    setCarregando(true)
    try {
      const resposta = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itens, 
          frete: freteFinal, 
          desconto: valorDesconto, 
          embalagemPresente,
          cashbackUsado: valorCashbackAplicado
        })
      })
      
      const dados = await resposta.json()
      
      if (!resposta.ok) throw new Error(dados.error || "Erro ao gerar pagamento")
      
      if (dados.urlPagamento) window.location.href = dados.urlPagamento
    } catch (error: any) {
      alert(error.message || "Erro ao processar. Tente novamente.")
    } finally { 
      setCarregando(false) 
    }
  }

  // 5. RETORNO CONDICIONAL (CARRINHO VAZIO)
  if (itens.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center bg-hb-black px-6">
        <h1 className="text-2xl font-light text-white uppercase tracking-widest mb-4 italic">Sua sacola está vazia</h1>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest border-b border-hb-gold text-hb-gold pb-1 hover:text-hb-goldLight transition">
          Explorar Coleções
        </Link>
      </main>
    )
  }

  // 6. RETORNO PRINCIPAL
  return (
    <main className="min-h-screen bg-hb-black py-16 relative">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-light text-white uppercase tracking-widest mb-12 text-center italic">Sua Sacola de Luxo</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-6">
            <div className="bg-hb-gray p-6 rounded-xl border border-gray-800 shadow-sm">
                {itens.map((item: any) => (
                  <div key={item.id} className="flex gap-6 py-6 border-b border-gray-800 last:border-0">
                    <img src={item.foto} className="w-20 h-20 object-cover rounded border border-gray-700" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">{item.nome}</h3>
                        <button onClick={() => removerDoCarrinho(item.id)} className="text-gray-500 hover:text-red-500 transition"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-gray-700 rounded overflow-hidden">
                          <button onClick={() => atualizarQuantidade(item.id, Math.max(1, item.quantidade - 1))} className="px-2 py-1 bg-hb-black text-gray-400 hover:text-white transition text-xs">-</button>
                          <span className="px-3 py-1 text-xs font-bold text-white">{item.quantidade}</span>
                          <button onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)} className="px-2 py-1 bg-hb-black text-gray-400 hover:text-white transition text-xs">+</button>
                        </div>
                        <p className="text-sm font-bold text-hb-gold">R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="bg-hb-gray p-6 rounded-xl border border-gray-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold text-hb-gold uppercase tracking-widest flex items-center gap-2">
                  <Truck size={16} /> Opções de Entrega
                </p>
                {freteGratis && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-900/30 border border-green-800 px-2 py-1 rounded">
                    <CheckCircle2 size={12} /> VOCÊ GANHOU FRETE GRÁTIS
                  </span>
                )}
              </div>

              {!freteGratis ? (
                <>
                  <form onSubmit={calcularFrete} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      placeholder="00000-000"
                      className="flex-1 px-4 py-3 text-sm bg-hb-black text-white border border-gray-700 rounded outline-none focus:border-hb-gold transition placeholder-gray-600"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={carregandoFrete || cep.length < 9}
                      className="bg-hb-gold text-hb-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-hb-goldLight transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {carregandoFrete ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
                    </button>
                  </form>

                  {erroFrete && <p className="text-red-500 text-xs mt-2 font-medium mb-4">{erroFrete}</p>}

                  {opcoesFrete.length > 0 && (
                    <div className="space-y-3">
                      {opcoesFrete.map((opcao, index) => (
                        <label 
                          key={index} 
                          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                            freteSelecionado === Number(opcao.preco) ? 'border-hb-gold bg-hb-black' : 'border-gray-700 hover:border-hb-gold'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input 
                              type="radio" 
                              name="frete" 
                              value={opcao.preco} 
                              checked={freteSelecionado === Number(opcao.preco)}
                              onChange={() => setFreteSelecionado(Number(opcao.preco))}
                              className="w-4 h-4 text-hb-gold focus:ring-hb-gold accent-hb-gold cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-white uppercase">{opcao.nome}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                Prazo: Até {opcao.prazo} dias úteis
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-black text-hb-gold">
                            R$ {Number(opcao.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">O frete é por nossa conta nesta compra! Sua joia será enviada com segurança.</p>
              )}
            </div>
          </div>

          <div className="w-full lg:w-96 space-y-4 flex-shrink-0">
            {saldoCashback > 0 && (
              <div className="bg-gradient-to-r from-hb-gray to-hb-black border border-hb-gold/30 text-white p-5 rounded-xl shadow-sm flex items-center justify-between mb-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                  <div className="bg-hb-gold/20 p-2.5 rounded-full text-hb-gold">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-hb-gold">Créditos HB</h3>
                    <p className="text-sm font-black text-white mt-0.5">Saldo: R$ {saldoCashback.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={usarCashback} 
                    onChange={() => setUsarCashback(!usarCashback)} 
                  />
                  <div className="w-10 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-hb-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hb-gold"></div>
                </label>
              </div>
            )}

            {elegivelBoasVindas && !cupom && (
              <div className="bg-green-900/20 p-5 rounded-xl border border-green-800 shadow-sm animate-in fade-in duration-500">
                <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Gift size={14} /> Presente de Boas-Vindas
                </h3>
                <p className="text-xs text-green-100 mb-4 leading-relaxed">
                  Como sua conta é nova, você tem <strong className="font-black text-green-400">10% OFF</strong> na sua primeira compra!
                </p>
                <button 
                  onClick={() => { setInputCupom('BEMVINDO10'); validarCupom(); }} 
                  className="bg-transparent border border-green-500 text-green-400 text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded hover:bg-green-800 transition w-full"
                >
                  Ativar Cupom BEMVINDO10
                </button>
              </div>
            )}

            {produtoBump && (
              <div className="bg-gradient-to-r from-hb-gold to-hb-goldDark p-[1px] rounded-xl shadow-md animate-in fade-in duration-500">
                <div className="bg-hb-gray p-5 rounded-[10px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-hb-gold" />
                    <p className="text-[10px] font-bold text-hb-gold uppercase tracking-widest">
                      Complete o Look (Oferta Especial)
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <img 
                      src={produtoBump.foto} 
                      alt={produtoBump.nome} 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase leading-tight mb-1 line-clamp-2">
                        {produtoBump.nome}
                      </h4>
                      <p className="text-[10px] text-gray-500 line-through">De: R$ {produtoBump.preco_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm font-black text-hb-gold">Por: R$ {produtoBump.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => adicionarAoCarrinho(produtoBump)}
                    className="w-full mt-4 bg-hb-black text-white border border-gray-700 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-hb-gold hover:text-hb-black transition flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Adicionar à Sacola
                  </button>
                </div>
              </div>
            )}

            <div className="bg-hb-gray p-6 rounded-xl border border-gray-800 shadow-sm">
              <p className="text-[10px] font-bold text-hb-gold uppercase tracking-widest mb-4">Cupom de Desconto</p>
              {cupom ? (
                <div className="flex items-center justify-between bg-green-900/30 p-3 rounded border border-green-800">
                  <div className="flex items-center gap-2 text-green-400">
                    <Ticket size={16} />
                    <span className="text-xs font-bold uppercase">{cupom.codigo} (-{cupom.desconto}%)</span>
                  </div>
                  <button onClick={removerCupom} className="text-green-400 hover:text-red-500"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputCupom}
                    onChange={(e) => setInputCupom(e.target.value)}
                    placeholder="CÓDIGO" 
                    className="flex-1 bg-hb-black border border-gray-700 p-3 rounded text-xs text-white uppercase outline-none focus:border-hb-gold placeholder-gray-600" 
                  />
                  <button onClick={validarCupom} disabled={validandoCupom} className="bg-hb-gold text-hb-black px-4 rounded text-[10px] font-bold uppercase disabled:opacity-50 flex justify-center items-center hover:bg-hb-goldLight transition">
                    {validandoCupom ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>

            <div className={`border rounded-xl p-5 flex items-center justify-between gap-4 transition-all duration-300 ${embalagemPresente ? 'bg-hb-black border-hb-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-hb-gray border-gray-800 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${embalagemPresente ? 'bg-hb-gold' : 'bg-hb-black border border-gray-700'}`}>
                  <Gift size={16} className={embalagemPresente ? 'text-hb-black' : 'text-gray-500'} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Embalagem de Presente</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">Caixa Veludo + Laço</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-black text-hb-gold">+ R$ 15</span>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={embalagemPresente} 
                    onChange={() => setEmbalagemPresente(!embalagemPresente)} 
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-hb-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-hb-gold"></div>
                </label>
              </div>
            </div>

            <div className="bg-hb-gray p-6 rounded-xl border border-gray-800 shadow-sm sticky top-24">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Resumo do Pedido</h2>
              <div className="space-y-4 text-xs font-medium text-gray-400 mb-6 border-b border-gray-700 pb-6">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className={freteGratis ? "text-green-400 font-bold" : "text-white"}>
                    {freteGratis ? 'GRÁTIS' : (freteSelecionado > 0 ? `R$ ${freteSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--')}
                  </span>
                </div>

                {embalagemPresente && (
                   <div className="flex justify-between text-hb-gold font-bold">
                     <span>Caixa de Presente</span>
                     <span>+ R$ 15,00</span>
                   </div>
                )}

                {cupom && (
                  <div className="flex justify-between text-green-400">
                    <span>Desconto ({cupom.codigo})</span>
                    <span>- R$ {valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {usarCashback && valorCashbackAplicado > 0 && (
                  <div className="flex justify-between text-hb-gold font-bold p-2 bg-hb-gold/10 rounded border border-hb-gold/20">
                    <span>Saldo Utilizado</span>
                    <span>- R$ {valorCashbackAplicado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-white text-sm uppercase">Total</span>
                <span className="text-xl font-bold text-hb-gold">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <button 
                onClick={finalizarCompra} 
                disabled={carregando || (freteFinal === 0 && !freteGratis)} 
                className="w-full bg-hb-gold text-hb-black py-4 font-bold text-xs uppercase tracking-widest hover:bg-hb-goldLight transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carregando ? <Loader2 className="animate-spin" size={18} /> : 'Finalizar Compra'}
              </button>
              {freteFinal === 0 && !freteGratis && (
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-3 text-center">Calcule o frete para continuar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {mostrarPopUpSaida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-hb-gray border border-gray-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
            <button onClick={() => setMostrarPopUpSaida(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-hb-black/50 rounded-full p-1 transition"><X size={20} /></button>
            <div className="h-40 bg-black relative flex items-center justify-center overflow-hidden border-b border-hb-gold/30">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800')] bg-cover bg-center opacity-30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <AlertCircle size={40} className="text-hb-gold mb-2 animate-bounce" />
                <h2 className="text-2xl font-light text-white uppercase tracking-widest">Espere!</h2>
              </div>
            </div>
            <div className="p-8 text-center">
              <h3 className="text-lg font-bold text-hb-gold uppercase tracking-widest mb-3">Não vá embora de mãos vazias</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Notamos que você ia sair, mas não queremos que você perca essas peças exclusivas. Finalize sua compra agora e ganhe <strong className="text-white">{novoDescontoRetencao}% DE DESCONTO</strong> no carrinho todo.
              </p>
              <div className="bg-hb-black border border-hb-gold border-dashed rounded-lg p-4 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Seu Cupom Exclusivo</p>
                <p className="text-xl font-black text-hb-gold tracking-[0.2em]">{codigoRetencao}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={aplicarDescontoRetencao} className="flex-1 bg-hb-gold text-hb-black py-4 rounded text-xs font-bold uppercase tracking-widest hover:bg-hb-goldLight transition shadow-lg">Aplicar {novoDescontoRetencao}% Off Agora</button>
                <button onClick={() => setMostrarPopUpSaida(false)} className="flex-1 bg-hb-black border border-gray-700 text-gray-300 py-4 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:text-white transition">Talvez Depois</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}