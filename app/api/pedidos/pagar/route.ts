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
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { pedidoId } = body

    // 1. Busca o pedido existente no Supabase para garantir o valor correto
    const { data: pedido, error: erroPedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single()

    if (erroPedido || !pedido) throw new Error('Pedido não encontrado')

    // 2. Monta o item único baseado no total do pedido salvo
    const preferenceItems = [{
      id: `RE-PAGAR-${pedido.id}`,
      title: `Pagamento do Pedido #${pedido.id} - HB Importados`,
      quantity: 1,
      unit_price: Number(Number(pedido.total).toFixed(2)),
      currency_id: 'BRL',
    }]

    // 3. Define as URLs de retorno (mantendo travado no localhost para seus testes locais)
    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: String(pedido.id),
        back_urls: {
          success: "http://localhost:3000/sucesso",
          failure: "http://localhost:3000/minha-conta",
          pending: "http://localhost:3000/minha-conta"
        }
      }
    })

    return NextResponse.json({ urlPagamento: response.init_point })

  } catch (error: any) {
    console.error('❌ ERRO RE-PAGAMENTO:', error.message || error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}