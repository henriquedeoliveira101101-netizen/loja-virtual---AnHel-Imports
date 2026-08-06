import Link from 'next/link'
import { ArrowRight, Diamond } from 'lucide-react'

export default function PaginaSobre() {
  return (
    <main className="min-h-screen bg-hb-black">
      {/* Banner */}
      <section className="bg-hb-gray py-24 text-center px-6 border-b border-hb-black">
        <Diamond size={32} className="text-hb-gold mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-light text-white uppercase tracking-widest italic mb-4">
          Nossa História
        </h1>
        <p className="text-hb-gold text-sm uppercase tracking-widest">A essência da HB Importados</p>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-light uppercase tracking-widest text-white mb-8">
          Mais do que joias, um legado.
        </h2>
        <div className="space-y-6 text-gray-400 leading-relaxed font-light text-sm md:text-base">
          <p>
            A <strong className="text-hb-gold font-normal">HB Importados</strong> nasceu da paixão por peças exclusivas e do desejo de trazer para o Brasil o que há de mais sofisticado no mercado mundial de joias. 
          </p>
          <p>
            Cada colar, pulseira e brinco que selecionamos passa por um rigoroso controle de qualidade. Trabalhamos apenas com materiais premium, garantindo não apenas o brilho imediato, mas a durabilidade que uma verdadeira joia de luxo exige.
          </p>
          <p>
            Acreditamos que o luxo não está apenas no produto, mas na experiência. Desde o momento em que você acessa nossa vitrine até o instante em que abre nossa caixa exclusiva em sua casa, nosso objetivo é fazer você se sentir único.
          </p>
        </div>

        <div className="mt-16">
          <Link 
            href="/colecoes" 
            className="inline-flex items-center gap-3 bg-hb-gold text-hb-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-hb-goldLight transition-colors"
          >
            Conheça Nossas Peças <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}