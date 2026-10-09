import nodemailer from 'nodemailer'

// Configuração do Gmail via Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function enviarEmailStatus(email: string, nome: string, status: string, dadoExtra?: string) {
  let assunto = "";
  let html = "";

  if (status === 'confirmado') {
    assunto = "Seu brilho está garantido! ✨";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="font-weight: 300; text-transform: uppercase; text-align: center; letter-spacing: 2px;">HB IMPORTADOS</h1>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Seu pedido foi confirmado com sucesso. Já estamos separando sua peça com todo carinho e cuidado. ✨</p>
        <p style="background: #fdfaf3; padding: 15px; border-left: 3px solid #D4AF37; margin: 20px 0;">
          💎 <strong>Você ganhou Cashback!</strong> Acabamos de adicionar 5% do valor desta compra como saldo em sua conta para você usar no seu próximo pedido.
        </p>
        <p>Assim que a caixa for despachada, enviaremos um novo e-mail com o código de rastreio para você acompanhar.</p>
        <br/>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #888; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
          Dica HB: Para sua joia durar mais, evite contato com perfumes e cremes!
        </p>
      </div>
    `;
  }

  if (status === 'postado' || status === 'enviado') {
    assunto = "Sua encomenda foi postada! 🚀";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="font-weight: 300; text-transform: uppercase; text-align: center; letter-spacing: 2px;">HB IMPORTADOS</h1>
        <p>Boa notícia, <strong>${nome}</strong>!</p>
        <p>Sua joia acaba de ser postada e já está a caminho do seu endereço.</p>
        
        <div style="background: #f9f9f9; padding: 30px; text-align: center; border-radius: 8px; border: 1px solid #eee; margin: 30px 0;">
          <p style="margin-bottom: 10px; font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold;">Seu Código de Rastreio:</p>
          <strong style="font-size: 24px; letter-spacing: 4px; color: #000;">${dadoExtra}</strong>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/minha-conta" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Acompanhar Linha do Tempo</a>
        </div>
      </div>
    `;
  }

  // ⭐ NOVO: E-mail de Troca Aprovada (Logística Reversa)
  if (status === 'troca_aprovada') {
    assunto = "Sua Troca foi Aprovada! (Código de Postagem) 📦";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="font-weight: 300; text-transform: uppercase; text-align: center; letter-spacing: 2px;">HB IMPORTADOS</h1>
        <p>Olá, <strong>${nome}</strong>.</p>
        <p>A sua solicitação de troca/devolução foi <strong>aprovada</strong> pela nossa equipe!</p>
        <p>Para nos enviar a joia de volta, vá até a agência dos Correios mais próxima e apresente o código de postagem reversa abaixo (a postagem é por nossa conta):</p>
        
        <div style="background: #f9f9f9; padding: 30px; text-align: center; border-radius: 8px; border: 1px solid #eee; margin: 30px 0;">
          <p style="margin-bottom: 10px; font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold;">Código de Autorização:</p>
          <strong style="font-size: 28px; letter-spacing: 6px; color: #000;">${dadoExtra}</strong>
        </div>
        
        <p style="font-size: 14px; color: #555;">Por favor, embale o produto na caixa original, sem indícios de uso, com todos os acessórios acompanhantes.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="font-size: 11px; color: #999; text-align: center; margin-top: 20px;">
          Em caso de dúvidas, responda a este e-mail.
        </p>
      </div>
    `;
  }

  // ⭐ E-mail de Recuperação de Senha
  if (status === 'recuperacao') {
    assunto = "Recuperação de Senha - HB Importados";
    const linkRecuperacao = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${dadoExtra}`;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="font-weight: 300; text-transform: uppercase; text-align: center; letter-spacing: 2px;">HB IMPORTADOS</h1>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para escolher uma nova senha e recuperar seu acesso:</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${linkRecuperacao}" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Redefinir Minha Senha</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #999; text-align: center; margin-top: 20px;">
          Este link é válido por 1 hora. Se você não solicitou a alteração, por favor, ignore este e-mail e sua conta permanecerá segura.
        </p>
      </div>
    `;
  }

  // Se o status não for nenhum desses, não faz nada
  if (!assunto) return { sucesso: false, error: 'Status de e-mail inválido.' };

  // Tenta enviar o e-mail usando o Gmail (Nodemailer)
  try {
    const info = await transporter.sendMail({
      from: `"HB Importados" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: assunto,
      html: html,
    });
    
    console.log("✅ E-mail enviado com sucesso:", info.messageId);
    return { sucesso: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail via Gmail:", error);
    return { sucesso: false, error };
  }
}