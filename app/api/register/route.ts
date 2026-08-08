import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Usa o cliente tratado
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// Configuração do Gmail (Substituindo o Resend)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

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

    // 4. Envio de e-mail via Gmail (Garante envio gratuito para QUALQUER e-mail)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"HB Importados" <${process.env.EMAIL_USER}>`,
          to: emailFormatado, 
          subject: `${codigoVerificacao} é o seu código de verificação HB`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h2>Seu código de verificação HB</h2>
              <p>Olá ${nome}, use o código abaixo para ativar sua conta e acessar nossas coleções:</p>
              <h1 style="letter-spacing: 5px; font-size: 32px; background: #f9f9f9; border: 1px dashed #ccc; padding: 15px; border-radius: 10px; display: inline-block; margin-top: 20px;">
                ${codigoVerificacao}
              </h1>
            </div>
          `
        })
      } catch (e) {
        console.error("Erro ao enviar e-mail via Gmail (Cadastro mantido):", e)
      }
    } else {
      console.warn("Aviso: Variáveis EMAIL_USER e EMAIL_PASS não encontradas na Vercel.")
    }

    return NextResponse.json({ sucesso: true })

  } catch (error: any) {
    console.error("Erro crítico no registro:", error)
    return NextResponse.json({ error: error?.message || 'Erro ao criar conta no servidor.' }, { status: 500 })
  }
}