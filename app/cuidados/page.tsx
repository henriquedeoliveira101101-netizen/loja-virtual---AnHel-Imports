import { Droplets, Sparkles, Archive, ShieldAlert, FlaskConical, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function PaginaCuidados() {
  return (
    <main className="min-h-screen bg-hb-black py-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-widest mb-4 italic">
            Guia de Cuidados
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Nossas joias são produzidas com materiais de alta qualidade e exigem cuidados especiais para manterem seu brilho e acabamento impecáveis. Siga estas orientações para preservar sua peça.
          </p>
        </div>

        {/* Grid de Regras Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          
          {/* Regra 1: Água */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm transition-colors hover:border-hb-gold/50">
            <div className="w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center mb-6">
              <Droplets className="text-hb-gold" size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              Não Molhar
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Retire sua joia antes de tomar banho, entrar no mar ou na piscina. A água (especialmente com cloro ou sal) e sabonetes aceleram a oxidação e podem danificar o banho da peça permanentemente.
            </p>
          </div>

          {/* Regra 2: Perfumes e Cosméticos */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm transition-colors hover:border-hb-gold/50">
            <div className="w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-hb-gold" size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              Evite Perfumes
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cosméticos, cremes e perfumes contêm álcool e produtos químicos que corroem o banho da joia. Aplique seus produtos, espere a pele secar completamente e só então coloque sua peça.
            </p>
          </div>

          {/* Regra 3: Armazenamento */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm transition-colors hover:border-hb-gold/50">
            <div className="w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center mb-6">
              <Archive className="text-hb-gold" size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              Guarde em Local Seco
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              A umidade do ar é a maior inimiga dos metais. Guarde suas joias em local seco e escuro, preferencialmente na embalagem original ou em porta-joias forrados, separadas umas das outras para evitar riscos.
            </p>
          </div>

          {/* Regra 4: Limpeza */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm transition-colors hover:border-hb-gold/50">
            <div className="w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center mb-6">
              <FlaskConical className="text-hb-gold" size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              Produtos Químicos
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nunca utilize produtos de limpeza doméstica, álcool ou abrasivos para limpar sua joia. Para devolver o brilho, utilize apenas uma flanela mágica seca e limpa, esfregando suavemente.
            </p>
          </div>

        </div>

        {/* Caixa de Atenção / Termo de Garantia */}
        <div className="bg-gradient-to-r from-hb-gray to-hb-black border border-hb-gold/30 text-white p-8 md:p-10 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 p-4 bg-hb-gold/20 rounded-full">
              <ShieldAlert size={32} className="text-hb-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-hb-gold uppercase tracking-widest mb-2">
                Sobre a Nossa Garantia
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Nossa garantia cobre exclusivamente defeitos de fabricação. Danos causados por mau uso, como contato com água do mar, piscina, produtos químicos, perfumes, quedas ou atritos intensos, caracterizam desgaste inadequado e <strong className="text-white">não estão cobertos pela garantia</strong>. Ao seguir os cuidados acima, sua joia manterá o padrão HB Importados por muito mais tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Voltar */}
        <div className="mt-16 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-hb-gold uppercase tracking-widest hover:text-hb-goldLight transition-colors border-b-2 border-hb-gold pb-1 hover:border-hb-goldLight"
          >
            Voltar para a Loja <ChevronRight size={14} />
          </Link>
        </div>

      </div>
    </main>
  )
}