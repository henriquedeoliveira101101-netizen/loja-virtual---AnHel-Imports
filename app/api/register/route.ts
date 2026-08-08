import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build')

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }

    const emailFormatado = email.toLowerCase().trim()

    // 1. Criptografa a senha
    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    // 2. Gera o código de verificação
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. Verifica se o cliente já tem conta
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailFormatado)
      .maybeSingle()

    if (usuarioExistente) {
      if (usuarioExistente.email_verificado) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado. Faça login.' }, { status: 400 })
      } else {
        const { error: erroUpdate } = await supabase
          .from('usuarios')
          .update({
            nome,
            senha: senhaCriptografada,
            codigo_verificacao: codigoVerificacao
          })
          .eq('email', emailFormatado)

        if (erroUpdate) {
          console.error("Erro Supabase Update:", erroUpdate)
          return NextResponse.json({ error: 'Erro ao atualizar dados no banco.' }, { status: 500 })
        }
      }
    } else {
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

      if (erroInsert) {
        console.error("Erro Supabase Insert:", erroInsert)
        return NextResponse.json({ error: `Erro no banco: ${erroInsert.message}` }, { status: 500 })
      }
    }

    // 4. Envio de e-mail (Isolado para NUNCA travar o cadastro do usuário)
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'HB Importados <onboarding@resend.dev>',
          to: [emailFormatado],
          subject: `${codigoVerificacao} é o seu código HB`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h2>Seu código de verificação HB</h2>
              <h1 style="letter-spacing: 5px;">${codigoVerificacao}</h1>
            </div>
          `
        })
      } catch (e) {
        console.error("Erro ao enviar e-mail via Resend (Cadastro mantido):", e)
      }
    }

    return NextResponse.json({ sucesso: true })

  } catch (error: any) {
    console.error("Erro crítico no registro:", error)
    return NextResponse.json({ error: error?.message || 'Erro ao criar conta no servidor.' }, { status: 500 })
  }
}