import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabase } from '@/lib/supabase'
import { enviarEmailStatus } from '@/lib/mail' // <-- Importa a nossa função centralizada

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Identifica o ID do pagamento enviado pelo Mercado Pago
    const paymentId = body.data?.id || body.resource?.split('/').pop()

    // Verifica se é uma notificação de pagamento
    if (paymentId && (body.type === 'payment' || body.action?.includes('payment'))) {
      const payment = new Payment(client)
      const resultado = await payment.get({ id: paymentId })

      const pedidoId = resultado.external_reference
      const statusPagamento = resultado.status 

      // Se o pagamento foi aprovado, iniciamos a automação
      if (pedidoId && statusPagamento === 'approved') {
        
        // 1. Buscamos o pedido no banco para pegar o e-mail, nome e o status atual
        const { data: pedido, error: errorPedido } = await supabase
          .from('pedidos')
          .select('*, usuarios(email, nome)')
          .eq('id', pedidoId)
          .single()

        // 🚨 TRAVA DE SEGURANÇA: Só executa se o pedido ainda não estiver confirmado (Evita dar cashback e mandar e-mail 2x)
        if (pedido && !errorPedido && pedido.status !== 'confirmado') {
          
          // 2. Atualiza o status no Supabase para 'confirmado'
          await supabase
            .from('pedidos')
            .update({ status: 'confirmado' })
            .eq('id', pedidoId)

          // 🚨 3. MÁGICA DO CASHBACK (Injeta os 5% do total da compra na conta do cliente)
          const emailParaCashback = pedido.usuarios?.email || pedido.cliente_email
          if (emailParaCashback) {
            const valorCashbackGanho = Number(pedido.total) * 0.05 // 5% do valor do pedido

            if (valorCashbackGanho > 0) {
              // Puxa o saldo que ele já tem hoje
              const { data: usuario } = await supabase
                .from('usuarios')
                .select('saldo_cashback')
                .eq('email', emailParaCashback)
                .single()

              if (usuario) {
                const novoSaldo = Number(usuario.saldo_cashback || 0) + valorCashbackGanho
                
                // Salva o novo cofre gordinho no banco
                await supabase
                  .from('usuarios')
                  .update({ saldo_cashback: novoSaldo })
                  .eq('email', emailParaCashback)
              }
            }
          }

          // 4. ENVIO DE E-MAIL AUTOMÁTICO (Usando a sua lib centralizada)
          if (pedido.usuarios?.email) {
            await enviarEmailStatus(
              pedido.usuarios.email, 
              pedido.usuarios.nome, 
              'confirmado'
            )
          }

          console.log(`✅ Sucesso: Pedido #${pedidoId} pago, cashback de 5% adicionado e e-mail enviado!`)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Erro no Webhook:', error)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 })
  }
}