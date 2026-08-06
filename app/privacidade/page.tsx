'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function PaginaPrivacidade() {
  return (
    <main className="min-h-screen bg-hb-black py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/cadastro" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-hb-gold transition mb-12">
          <ArrowLeft size={14} /> Voltar ao Cadastro
        </Link>

        <div className="flex items-center gap-4 mb-12 pb-8 border-b border-hb-gray">
          <div className="bg-hb-gray border border-gray-800 p-3 rounded-full">
            <ShieldCheck size={24} className="text-hb-gold" />
          </div>
          <h1 className="text-3xl font-light uppercase tracking-widest italic text-white">Privacidade</h1>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed font-light">
          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">1. Coleta de Dados (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), coletamos apenas as informações necessárias para processar seu pedido: nome, CPF, endereço de entrega e e-mail.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">2. Uso das Informações</h2>
            <p>Seus dados são utilizados exclusivamente para: processar pagamentos via Mercado Pago, gerar etiquetas de frete e enviar atualizações de rastreio por e-mail. Nunca vendemos seus dados a terceiros.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">3. Segurança</h2>
            <p>Utilizamos protocolos de segurança SSL para criptografar suas informações durante a navegação. Dados de cartão de crédito não ficam armazenados em nossos servidores, sendo processados diretamente pelo ambiente seguro do Mercado Pago.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">4. Cookies</h2>
            <p>Utilizamos cookies para melhorar sua experiência de navegação e lembrar os itens que você adicionou à sua sacola de luxo.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">5. Seus Direitos</h2>
            <p>A qualquer momento, você pode solicitar o acesso, correção ou exclusão definitiva dos seus dados de nosso banco de dados através do e-mail contato@hbimportados.com.br.</p>
          </section>
        </div>
      </div>
    </main>
  )
}