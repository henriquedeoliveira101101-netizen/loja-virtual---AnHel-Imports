import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-hb-black text-gray-400 py-16 border-t border-hb-gray">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Coluna 1: Sobre a Marca */}
        <div className="flex flex-col">
          <Link href="/" className="text-2xl font-bold tracking-widest text-hb-gold mb-6 hover:text-hb-goldLight transition-colors">
            HB IMPORTADOS
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light">
            Especialistas em joias premium e relógios importados. Trazendo o que há de mais exclusivo no mundo da alta joalheria diretamente para você.
          </p>
          <div className="flex gap-4 text-gray-500">
            <a href="#" className="hover:text-hb-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="hover:text-hb-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        {/* Coluna 2: Links Úteis */}
        <div className="flex flex-col">
          <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Nossa Loja</h4>
          <nav className="flex flex-col gap-3 text-sm text-gray-500 font-light">
            <Link href="/#destaques" className="hover:text-hb-gold transition-colors">Destaques da Semana</Link>
            <Link href="/#lancamentos" className="hover:text-hb-gold transition-colors">Lançamentos</Link>
            <Link href="/#mais-vendidos" className="hover:text-hb-gold transition-colors">Mais Vendidos</Link>
            <Link href="/sobre" className="hover:text-hb-gold transition-colors">Sobre Nós</Link>
          </nav>
        </div>

        {/* Coluna 3: Atendimento */}
        <div className="flex flex-col">
          <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Atendimento</h4>
          <nav className="flex flex-col gap-3 text-sm text-gray-500 font-light">
            <Link href="/fale-conosco" className="hover:text-hb-gold transition-colors">Fale Conosco</Link>
            <Link href="/fretes-e-entregas" className="hover:text-hb-gold transition-colors">Fretes e Entregas</Link>
            <Link href="/cuidados" className="hover:text-hb-gold transition-colors">Guia de Cuidados e Garantia</Link>
            <Link href="/trocas" className="hover:text-hb-gold transition-colors">Trocas e Devoluções</Link>
          </nav>
        </div>

        {/* Coluna 4: Contato */}
        <div className="flex flex-col">
          <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Contato</h4>
          <div className="flex flex-col gap-4 text-sm text-gray-500 font-light">
            <div className="flex items-center gap-3 hover:text-hb-goldLight transition-colors">
              <Mail size={16} className="text-hb-gold" />
              <span>contato@hbimportados.com.br</span>
            </div>
            <div className="flex items-center gap-3 hover:text-hb-goldLight transition-colors">
              <Phone size={16} className="text-hb-gold" />
              <span>(47) 99999-9999</span>
            </div>
            <div className="flex items-start gap-3 mt-2 hover:text-hb-goldLight transition-colors">
              <MapPin size={16} className="mt-1 flex-shrink-0 text-hb-gold" />
              <span>Joinville, SC<br />Atendimento para todo o Brasil</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-hb-gray flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-600 font-medium">
          © {new Date().getFullYear()} HB Importados. Todos os direitos reservados.
        </p>
        <div className="text-xs text-gray-500 flex gap-4 font-bold uppercase tracking-widest">
          <span className="text-hb-gold">Ambiente 100% Seguro</span>
          <span className="text-gray-700">•</span>
          <span className="text-hb-gold">Compra Garantida</span>
        </div>
      </div>
    </footer>
  )
}