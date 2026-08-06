import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { supabase } from '@/lib/supabase' 
import { getServerSession } from "next-auth"

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'SEU_TOKEN_AQUI' 
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    const body = await request.json()
    
    // 1. RECEBENDO O CARRINHO
    const { itens, frete, desconto, embalagemPresente, cashbackUsado } = body

    if (!itens || itens.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    // 2. MATEMÁTICA DA COMPRA
    const subtotal = itens.reduce((acc: number, item: any) => acc + (item.preco * item.quantidade), 0)
    
    // 🚨 TRAVA DE SEGURANÇA: O backend zera o frete automaticamente se o valor bater 100 reais
    const freteCalculado = subtotal >= 100 ? 0 : Number(frete)

    const valorEmbalagem = embalagemPresente ? 15.00 : 0
    const valorDesconto = desconto ? Number(desconto) : 0
    const valorCashback = cashbackUsado ? Number(cashbackUsado) : 0
    
    // Calcula usando o freteValidado
    const subtotalComDesconto = subtotal + freteCalculado + valorEmbalagem - valorDesconto
    
    const totalGeral = Math.max(0, subtotalComDesconto - valorCashback)
    const statusPedido = totalGeral === 0 ? 'pago' : 'pendente'

    // 3. REGISTRAR O PEDIDO NO BANCO
    const { data: pedidoSalvo, error: erroSupabase } = await supabase
      .from('pedidos')
      .insert({
        cliente_email: session?.user?.email || 'Visitante',
        cliente_nome: session?.user?.name || 'Cliente HB',
        status: statusPedido,
        total: totalGeral, 
        itens: itens, 
        codigo_rastreio: null
      })
      .select()
      .single()

    if (erroSupabase) throw new Error('Falha ao registar pedido na base de dados.')

    // 4. ABATER O CASHBACK DO COFRE DO CLIENTE SE ELE USOU
    if (valorCashback > 0 && session?.user?.email) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('saldo_cashback')
        .eq('email', session.user.email)
        .single()

      if (usuario) {
        const novoSaldo = Math.max(0, Number(usuario.saldo_cashback) - valorCashback)
        await supabase
          .from('usuarios')
          .update({ saldo_cashback: novoSaldo })
          .eq('email', session.user.email)
      }
    }

    // 5. O DESVIO INTELIGENTE
    if (totalGeral === 0) {
      return NextResponse.json({ urlPagamento: "http://localhost:3000/sucesso" })
    }

    // 6. GERA O LINK DO MERCADO PAGO
    let preferenceItems = []

    if (valorDesconto > 0 || valorCashback > 0) {
      preferenceItems.push({
        id: 'PEDIDO_HB',
        title: 'Pedido HB Importados (Com Desconto/Cashback)',
        quantity: 1,
        unit_price: Number(totalGeral.toFixed(2)),
        currency_id: 'BRL',
      })
    } else {
      preferenceItems = itens.map((item: any) => ({
        id: String(item.id),
        title: String(item.nome),
        quantity: Number(item.quantidade),
        unit_price: Number(item.preco),
        currency_id: 'BRL',
      }))

      // Usando a variável validada
      if (freteCalculado > 0) {
        preferenceItems.push({
          id: 'FRETE',
          title: 'Custo de Envio (Frete)',
          quantity: 1,
          unit_price: freteCalculado,
          currency_id: 'BRL',
        })
      }

      if (embalagemPresente) {
        preferenceItems.push({
          id: 'EMBALAGEM',
          title: 'Embalagem para Presente',
          quantity: 1,
          unit_price: 15.00,
          currency_id: 'BRL',
        })
      }
    }

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: pedidoSalvo ? String(pedidoSalvo.id) : undefined,
        back_urls: {
          success: "http://localhost:3000/sucesso",
          failure: "http://localhost:3000/carrinho",
          pending: "http://localhost:3000/carrinho"
        }
      }
    })

    return NextResponse.json({ urlPagamento: response.init_point })

  } catch (error: any) {
    console.error('❌ ERRO CHECKOUT:', error.message || error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}