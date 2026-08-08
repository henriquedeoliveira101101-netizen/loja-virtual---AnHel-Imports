import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

// Usa a chave do Resend ou uma string padrão para o build na Vercel não falhar
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build')

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }

    const emailFormatado = email.toLowerCase().trim()

    // 1. Verifica se o cliente já tem conta com este e-mail
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailFormatado)
      .single()

    // 2. Criptografa a senha
    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    // 3. Gera o código de verificação de 6 dígitos
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString()

    if (usuarioExistente) {
      // Se o usuário já existe e ESTÁ VERIFICADO, bloqueia
      if (usuarioExistente.email_verificado) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado e verificado. Faça login.' }, { status: 400 })
      } else {
        // Se existe mas NÃO ESTÁ VERIFICADO, atualiza o código e a nova senha para ele tentar de novo
        const { error: erroUpdate } = await supabase
          .from('usuarios')
          .update({
            nome,
            senha: senhaCriptografada,
            codigo_verificacao: codigoVerificacao
          })
          .eq('email', emailFormatado)

        if (erroUpdate) throw erroUpdate
      }
    } else {
      // 4. Cria o usuário do zero caso ainda não exista
      const { error: erroInsert } = await supabase
        .from('usuarios')
        .insert([
          { 
            nome, 
            email: emailFormatado, 
            senha: senhaCriptografada,
            codigo_verificacao: codigoVerificacao,
            email_verificado: false
          }
        ])

      if (erroInsert) throw erroInsert
    }

    // 5. Envia o e-mail com o código de verificação via Resend
    try {
      const { data, error: resendError } = await resend.emails.send({
        from: 'HB Importados <onboarding@resend.dev>', // Remetente de testes do Resend
        to: [emailFormatado],
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