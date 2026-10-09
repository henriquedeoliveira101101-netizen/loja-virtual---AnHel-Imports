import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabase } from '@/lib/supabase'
import { enviarEmailStatus } from '@/lib/mail'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
})

export async function POST(request: Request) {
  try {
    // 1. Pega os parâmetros da URL (Search Params) que o Mercado Pago costuma usar
    const url = new URL(request.url)
    const queryId = url.searchParams.get('data.id') || url.searchParams.get('id')
    const queryTopic = url.searchParams.get('type') || url.searchParams.get('topic')

    // 2. Pega os dados do corpo da requisição (se houver)
    let body: any = {}
    try {
      body = await request.json()
    } catch (e) {
      // Ignora erro se a requisição vier sem corpo JSON
    }
    
    // Identifica o ID do pagamento (tenta ler do Body, e se não tiver, lê da URL)
    const paymentId = body?.data?.id || body?.resource?.split('/').pop() || queryId

    // Verifica se é uma notificação de pagamento
    const isPayment = body?.type === 'payment' || body?.action?.includes('payment') || queryTopic === 'payment'

    if (paymentId && isPayment) {
      
      // 🚨 IGNORA O BOTÃO DE TESTE DO MERCADO PAGO:
      if (paymentId === '123456') {
         console.log('Teste do Mercado Pago recebido com sucesso! (ID Falso ignorado)')
         return NextResponse.json({ received: true, test: true }, { status: 200 })
      }

      // Busca as informações reais do pagamento
      const payment = new Payment(client)
      const resultado = await payment.get({ id: paymentId })

      const pedidoId = resultado.external_reference
      const statusPagamento = resultado.status 

      // Se o pagamento foi aprovado, iniciamos a automação
      if (pedidoId && statusPagamento === 'approved') {
        
        const { data: pedido, error: errorPedido } = await supabase
          .from('pedidos')
          .select('*, usuarios(email, nome)')
          .eq('id', pedidoId)
          .single()

        // TRAVA DE SEGURANÇA: Só executa se não estiver confirmado
        if (pedido && !errorPedido && pedido.status !== 'confirmado') {
          
          await supabase
            .from('pedidos')
            .update({ status: 'confirmado' })
            .eq('id', pedidoId)

          // MÁGICA DO CASHBACK
          const emailParaCashback = pedido.usuarios?.email || pedido.cliente_email
          if (emailParaCashback) {
            const valorCashbackGanho = Number(pedido.total) * 0.05

            if (valorCashbackGanho > 0) {
              const { data: usuario } = await supabase
                .from('usuarios')
                .select('saldo_cashback')
                .eq('email', emailParaCashback)
                .single()

              if (usuario) {
                const novoSaldo = Number(usuario.saldo_cashback || 0) + valorCashbackGanho
                await supabase
                  .from('usuarios')
                  .update({ saldo_cashback: novoSaldo })
                  .eq('email', emailParaCashback)
              }
            }
          }

          // ENVIO DE E-MAIL
          const emailParaNotificar = pedido.usuarios?.email || pedido.cliente_email
          const nomeParaNotificar = pedido.usuarios?.nome || pedido.cliente_nome || 'Cliente AnHel'

          if (emailParaNotificar) {
            await enviarEmailStatus(emailParaNotificar, nomeParaNotificar, 'confirmado')
          }

          console.log(`✅ Sucesso: Pedido #${pedidoId} pago, cashback e e-mail enviados!`)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Erro no Webhook:', error)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 })
  }
}