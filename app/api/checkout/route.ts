import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { supabase } from '@/lib/supabase' 
import { getServerSession } from "next-auth"
import nodemailer from 'nodemailer'

// 0. CONFIGURAÇÃO DO E-MAIL (Usa as variáveis que já estão na Vercel)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

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
    
    const freteCalculado = subtotal >= 100 ? 0 : Number(frete)
    const valorEmbalagem = embalagemPresente ? 15.00 : 0
    const valorDesconto = desconto ? Number(desconto) : 0
    const valorCashback = cashbackUsado ? Number(cashbackUsado) : 0
    
    const subtotalComDesconto = subtotal + freteCalculado + valorEmbalagem - valorDesconto
    
    const totalGeral = Math.max(0, subtotalComDesconto - valorCashback)
    const statusPedido = totalGeral === 0 ? 'pago' : 'pendente'

    // 3. REGISTRAR O PEDIDO NO BANCO
    const emailCliente = session?.user?.email || body.email || 'Visitante'
    const nomeCliente = session?.user?.name || 'Cliente'

    const { data: pedidoSalvo, error: erroSupabase } = await supabase
      .from('pedidos')
      .insert({
        cliente_email: emailCliente,
        cliente_nome: nomeCliente,
        status: statusPedido,
        total: totalGeral, 
        itens: itens, 
        codigo_rastreio: null
      })
      .select()
      .single()

    if (erroSupabase) throw new Error('Falha ao registar pedido na base de dados.')

    // 4. DISPARO DE E-MAIL DO PEDIDO (Não trava a compra se der erro)
    try {
      if (emailCliente !== 'Visitante') {
        const statusTexto = statusPedido === 'pago' ? 'Aprovado' : 'Aguardando Pagamento'
        const corStatus = statusPedido === 'pago' ? '#4ade80' : '#D4AF37' // Verde ou Dourado
        
        await transporter.sendMail({
          from: `"AnHel Imports" <${process.env.EMAIL_USER}>`,
          to: emailCliente,
          subject: `Pedido #${pedidoSalvo.id} Recebido - AnHel Imports`,
          html: `
            <div style="font-family: 'Helvetica', sans-serif; background-color: #111111; color: #ffffff; padding: 40px; text-align: center; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;">AnHel Imports</h2>
              <p>Olá <strong>${nomeCliente}</strong>, recebemos o seu pedido!</p>
              <div style="background-color: #000; border: 1px solid #333; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 5px 0;">Número do Pedido: <strong style="color: #fff;">#${pedidoSalvo.id}</strong></p>
                <p style="margin: 5px 0;">Status: <strong style="color: ${corStatus}; text-transform: uppercase;">${statusTexto}</strong></p>
                <p style="margin: 5px 0;">Total: <strong style="color: #fff;">R$ ${totalGeral.toFixed(2)}</strong></p>
              </div>
              <p style="font-size: 14px; color: #aaa;">Seu pagamento está sendo processado de forma segura.</p>
              <hr style="border-top: 1px solid #333; margin: 30px 0;" />
              <p style="font-size: 12px; color: #666;">Você pode acompanhar a entrega acessando 'Minha Conta' em nosso site.</p>
            </div>
          `
        })
      }
    } catch (emailError) {
      console.error("Erro ao enviar email do pedido:", emailError)
    }

    // 5. ABATER O CASHBACK DO COFRE DO CLIENTE
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

    // BASE URL PARA FUNCIONAR NA VERCEL E LOCALHOST
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // 6. O DESVIO INTELIGENTE (Pagamento R$0 com cashback)
    if (totalGeral === 0) {
      return NextResponse.json({ urlPagamento: `${baseUrl}/sucesso?external_reference=${pedidoSalvo.id}` })
    }

    // 7. GERA O LINK DO MERCADO PAGO
    let preferenceItems = []

    if (valorDesconto > 0 || valorCashback > 0) {
      preferenceItems.push({
        id: 'PEDIDO_HB',
        title: 'Pedido AnHel Imports',
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
        external_reference: String(pedidoSalvo.id),
        
        // 👇 AQUI ESTÁ A CORREÇÃO: O MERCADO PAGO AGORA SABE ONDE AVISAR 👇
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        
        back_urls: {
          success: `${baseUrl}/sucesso`,
          failure: `${baseUrl}/carrinho`,
          pending: `${baseUrl}/carrinho`
        }
      }
    })

    return NextResponse.json({ urlPagamento: response.init_point })

  } catch (error: any) {
    console.error('❌ ERRO CHECKOUT:', error.message || error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}