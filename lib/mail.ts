import { Resend } from 'resend';

// Adicionamos um fallback para o build da Vercel não quebrar se a chave não estiver presente na compilação
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build');

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
        <p>Assim que a caixa for despachada, enviaremos um novo e-mail com o código de rastreio para você acompanhar.</p>
        <br/>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #888; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
          Dica HB: Para sua joia durar mais, evite contato com perfumes e cremes!
        </p>
      </div>
    `;
  }

  if (status === 'postado') {
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
          <a href="https://loja-virtual-an-hel-imports.vercel.app/minha-conta" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Acompanhar Linha do Tempo</a>
        </div>
      </div>
    `;
  }

  // ⭐ E-mail de Recuperação de Senha
  if (status === 'recuperacao') {
    assunto = "Recuperação de Senha - HB Importados";
    const linkRecuperacao = `${process.env.NEXTAUTH_URL || 'https://loja-virtual-an-hel-imports.vercel.app'}/redefinir-senha?token=${dadoExtra}`;
    
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

  // Tenta enviar o e-mail (com proteção contra erros)
  try {
    const data = await resend.emails.send({
      from: 'HB Importados <onboarding@resend.dev>', // Use este remetente para testes
      to: email,
      subject: assunto,
      html: html,
    });
    console.log("RESPOSTA DO RESEND:", data);
    return { sucesso: true, data };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { sucesso: false, error };
  }
}