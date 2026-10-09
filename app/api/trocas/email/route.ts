import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { email, nome, codigoRastreio } = await request.json()

    if (!email || !codigoRastreio) {
      return NextResponse.json({ error: 'Faltam dados para o e-mail.' }, { status: 400 })
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"AnHel Imports" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Sua Troca foi Aprovada! (Código de Postagem) - AnHel Imports`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; color: #ffffff; padding: 40px 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #D4AF37; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 30px; font-weight: 300;">
              AnHel Imports
            </h2>
            <p style="font-size: 16px; color: #cccccc; line-height: 1.6; margin-bottom: 10px;">
              Olá, <strong>${nome}</strong>.
            </p>
            <p style="font-size: 16px; color: #cccccc; margin-bottom: 30px;">
              Sua solicitação de troca/devolução foi <strong>aprovada</strong>! Vá até a agência dos Correios mais próxima e apresente o código de postagem reversa abaixo. A postagem é por nossa conta.
            </p>
            
            <div style="background-color: #000000; border: 1px solid #D4AF37; padding: 20px 40px; border-radius: 4px; display: inline-block; margin-bottom: 40px;">
              <p style="font-size: 10px; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Código de Autorização</p>
              <h1 style="color: #ffffff; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">
                ${codigoRastreio}
              </h1>
            </div>

            <p style="font-size: 14px; color: #999999; margin-bottom: 20px;">
              Por favor, embale o produto na caixa original, sem indícios de uso, com todos os acessórios acompanhantes.
            </p>
            <hr style="border: none; border-top: 1px solid #333333; margin-bottom: 20px;" />
            <p style="font-size: 12px; color: #666666; line-height: 1.5;">
              © 2026 AnHel Imports. Todos os direitos reservados.
            </p>
          </div>
        `
      })
    }

    return NextResponse.json({ sucesso: true })
  } catch (error) {
    console.error("Erro ao enviar email de reversa:", error)
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail.' }, { status: 500 })
  }
}