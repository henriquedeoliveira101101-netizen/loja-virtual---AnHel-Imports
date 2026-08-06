import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json()

    // 1. Verifica se o cliente já tem conta com este e-mail
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    // 2. Criptografa a nova senha
    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    // 3. Geração do novo código de verificação
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString()

    if (usuarioExistente) {
      // Se o usuário existe e JÁ ESTÁ VERIFICADO, bloqueia.
      if (usuarioExistente.email_verificado) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado e verificado. Faça login.' }, { status: 400 })
      } else {
        // Se existe mas NÃO ESTÁ VERIFICADO, atualiza o código e a senha para ele tentar de novo
        const { error: erroUpdate } = await supabase
          .from('usuarios')
          .update({
            nome,
            senha: senhaCriptografada,
            codigo_verificacao: codigoVerificacao
          })
          .eq('email', email)

        if (erroUpdate) throw erroUpdate
      }
    } else {
      // 4. Se não existe, cria um novo usuário do zero
      const { error: erroInsert } = await supabase
        .from('usuarios')
        .insert([
          { 
            nome, 
            email, 
            senha: senhaCriptografada,
            codigo_verificacao: codigoVerificacao,
            email_verificado: false
          }
        ])

      if (erroInsert) throw erroInsert
    }

    // 5. ENVIO DO E-MAIL VIA RESEND
    try {
      const { data, error: resendError } = await resend.emails.send({
        from: 'HB Importados <onboarding@resend.dev>', // USE O EMAIL DE TESTE DO RESEND
        to: [email], // ATENÇÃO: No plano grátis, tem que ser o SEU email cadastrado no Resend
        subject: `${codigoVerificacao} é o seu código de verificação HB`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #eee; padding: 40px; border-radius: 20px;">
            <h1 style="color: #000; text-transform: uppercase; letter-spacing: 4px; font-weight: 300;">HB IMPORTADOS</h1>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Olá <strong>${nome}</strong>, bem-vindo à nossa curadoria exclusiva.</p>
            <p style="color: #666; font-size: 14px;">Use o código abaixo para confirmar sua conta e acessar as coleções:</p>
            
            <div style="background: #f9f9f9; padding: 20px; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 10px; border: 1px dashed #ccc;">
              ${codigoVerificacao}
            </div>
          </div>
        `
      })

      if (resendError) {
        console.error("ERRO DO RESEND:", resendError)
      }
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError)
    }

    return NextResponse.json({ sucesso: true })

  } catch (error) {
    console.error("Erro no cadastro:", error)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }
}