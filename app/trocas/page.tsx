import { RefreshCcw, ShieldAlert, BadgeInfo, Tag, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function PaginaTrocas() {
  return (
    <main className="min-h-screen bg-hb-black py-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-widest mb-4 italic">
            Trocas e Devoluções
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Nossa política foi elaborada com base no Código de Defesa do Consumidor (CDC) para garantir a sua segurança e a transparência em nossas relações.
          </p>
        </div>

        <div className="space-y-8 mb-16">
          
          {/* Regra 1: Arrependimento e Troca Padrão */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-start transition-colors hover:border-hb-gold/50">
            <div className="flex-shrink-0 w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center">
              <RefreshCcw className="text-hb-gold" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
                Direito de Arrependimento (7 dias)
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Você tem o direito de desistir da compra em até <strong className="text-gray-200">7 (sete) dias corridos</strong> após o recebimento do produto, conforme o Art. 49 do CDC. Para que a devolução ou troca seja aceita, a joia deve estar em sua embalagem original, sem qualquer indício de uso, sem odores, sem arranhões e acompanhada de todos os acessórios e certificados.
              </p>
            </div>
          </div>

          {/* Regra 2: Brincos e Higiene (CRÍTICO) */}
          <div className="bg-red-900/20 p-8 rounded-2xl border border-red-800/30 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-hb-black border border-red-800/50 rounded-full flex items-center justify-center shadow-sm">
              <ShieldAlert className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">
                Brincos e Questões de Higiene
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed">
                Por normas de saúde e higiene pública, <strong className="text-red-300">não aceitamos devoluções ou trocas de brincos por desistência caso a embalagem ou lacre higiênico original tenha sido violado</strong>. O CDC não obriga a troca de itens de uso íntimo/pessoal por arrependimento se o lacre for rompido. A troca de brincos só será efetuada em caso de defeito de fabricação comprovado.
              </p>
            </div>
          </div>

          {/* Regra 3: Produtos em Promoção */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-start transition-colors hover:border-hb-gold/50">
            <div className="flex-shrink-0 w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center">
              <Tag className="text-hb-gold" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
                Peças em Promoção ou Outlet
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Para produtos adquiridos em categorias de promoção, liquidação ou com cupons de desconto agressivos, não realizamos trocas de modelo ou tamanho após o prazo de 7 dias de arrependimento. A troca desses itens será garantida <strong className="text-gray-200">exclusivamente</strong> em casos de defeito de fabricação.
              </p>
            </div>
          </div>

          {/* Regra 4: Defeitos de Fabricação */}
          <div className="bg-hb-gray p-8 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-start transition-colors hover:border-hb-gold/50">
            <div className="flex-shrink-0 w-12 h-12 bg-hb-black border border-gray-700 rounded-full flex items-center justify-center">
              <BadgeInfo className="text-hb-gold" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
                Defeitos de Fabricação
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nossas joias possuem garantia legal de <strong className="text-gray-200">90 dias</strong> contra defeitos de fabricação (Art. 26 do CDC). Caso a sua peça apresente problemas na cravação, fecho ou solda dentro deste prazo, realizaremos o reparo ou a troca. Lembre-se: danos por mau uso (quedas, produtos químicos, água do mar) não são cobertos (veja nosso Guia de Cuidados).
              </p>
            </div>
          </div>

        </div>

        {/* Como Solicitar */}
        <div className="bg-gradient-to-r from-hb-gray to-hb-black border border-hb-gold/30 text-white p-8 md:p-10 rounded-2xl shadow-lg text-center">
          <Mail size={32} className="mx-auto mb-4 text-hb-gold" />
          <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-hb-gold">
            Como solicitar sua troca?
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto">
            Envie um e-mail para <strong className="text-white">contato@hbimportados.com.br</strong> com o número do seu pedido, CPF e fotos ou vídeos claros do produto. Nossa equipe analisará e retornará com as instruções de postagem reversa em até 48 horas úteis.
          </p>
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