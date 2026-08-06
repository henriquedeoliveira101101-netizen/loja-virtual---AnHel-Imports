import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { pedidoId, produtoId, usuarioId, motivo, fotoUrl, precoProduto } = await request.json()

    // 1. Verificação de Prevenção a Fraudes (Histórico do Cliente)
    const { count: totalTrocas } = await supabase
      .from('trocas')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)

    const clienteSuspeito = totalTrocas && totalTrocas >= 3

    // 2. Regra de Negócio: Aprovação Automática vs Análise Manual
    // Se o motivo for defeito, o produto custar menos de R$ 50, e o cliente não for suspeito.
    const limiteAutoAprovacao = 50.00
    let statusTroca = 'analise_pendente'
    let cupomGerado = null

    if (motivo === 'defeito' && precoProduto <= limiteAutoAprovacao && !clienteSuspeito) {
      statusTroca = 'aprovado_automatico'
      
      // Gera Cupom com 10% de Bônus para reter o cliente na loja
      const valorComBonus = precoProduto * 1.10
      const codigoCupom = `TROCA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Salva o cupom no banco de dados
      await supabase.from('cupons').insert([{
        codigo: codigoCupom,
        desconto: 0, // Usamos valor fixo em vez de porcentagem neste caso
        valor_fixo: valorComBonus,
        usuario_id: usuarioId,
        ativo: true
      }])

      cupomGerado = { codigo: codigoCupom, valor: valorComBonus }
    }

    // 3. Registra a solicitação na tabela de Trocas
    const { data: novaTroca, error: erroInsert } = await supabase
      .from('trocas')
      .insert([{
        pedido_id: pedidoId,
        produto_id: produtoId,
        usuario_id: usuarioId,
        motivo,
        foto_url: fotoUrl,
        status: statusTroca
      }])
      .select()
      .single()

    if (erroInsert) throw erroInsert

    // 4. Retorna a resposta para o frontend
    if (statusTroca === 'aprovado_automatico') {
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Aprovado! Você não precisa devolver a peça.', 
        cupom: cupomGerado,
        status: statusTroca
      })
    } else {
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Solicitação recebida. Nossa equipe analisará as fotos e enviará o código de postagem reversa em até 48h.',
        status: statusTroca
      })
    }

  } catch (error) {
    console.error('Erro ao processar troca:', error)
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 })
  }
}