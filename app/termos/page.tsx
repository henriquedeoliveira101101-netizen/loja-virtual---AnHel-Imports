'use client'

import Link from 'next/link'
import { ArrowLeft, ScrollText } from 'lucide-react'

export default function PaginaTermos() {
  return (
    <main className="min-h-screen bg-hb-black py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/cadastro" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-hb-gold transition mb-12">
          <ArrowLeft size={14} /> Voltar ao Cadastro
        </Link>

        <div className="flex items-center gap-4 mb-12 pb-8 border-b border-hb-gray">
          <div className="bg-hb-gray border border-gray-800 p-3 rounded-full">
            <ScrollText size={24} className="text-hb-gold" />
          </div>
          <h1 className="text-3xl font-light uppercase tracking-widest italic text-white">Termos de Uso</h1>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed font-light">
          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar o site da HB Importados, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso site.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">2. Propriedade Intelectual</h2>
            <p>Todo o conteúdo incluído neste site, como textos, gráficos, logotipos, ícones, imagens e seleção de produtos, é de propriedade exclusiva da HB Importados e protegido pelas leis de direitos autorais brasileiras e internacionais.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">3. Políticas de Compra e Pagamento</h2>
            <p>Todas as compras estão sujeitas à confirmação de disponibilidade de estoque. Os preços e condições de pagamento são exclusivos para compras via site. Reservamo-nos o direito de corrigir eventuais erros de digitação em preços ou descrições.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">4. Trocas e Devoluções</h2>
            <p>O cliente tem o direito de arrependimento em até 7 dias corridos após o recebimento. Para joias e itens importados, o produto deve ser devolvido em sua embalagem original, sem sinais de uso e com todos os lacres intactos.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-hb-gold uppercase tracking-widest mb-4">5. Limitação de Responsabilidade</h2>
            <p>A HB Importados não se responsabiliza por danos decorrentes do uso inadequado das joias (contato com produtos químicos, perfumes ou quedas). As orientações de cuidado enviadas por e-mail devem ser seguidas rigorosamente.</p>
          </section>
        </div>
      </div>
    </main>
  )
}