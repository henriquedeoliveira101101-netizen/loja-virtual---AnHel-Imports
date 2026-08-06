import Link from 'next/link'

export default function PaginaColecoes() {
  const colecoes = [
    { nome: 'Colares Exclusivos', slug: 'colares', img: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800' },
    { nome: 'Pulseiras Premium', slug: 'pulseiras', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800' },
    { nome: 'Brincos de Luxo', slug: 'brincos', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800' }
  ]

  return (
    <main className="min-h-screen bg-hb-black py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-widest italic mb-4">
            Nossas Coleções
          </h1>
          <div className="w-12 h-[1px] bg-hb-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {colecoes.map((col) => (
            <Link key={col.slug} href={`/categoria/${col.slug}`} className="group relative h-[500px] overflow-hidden rounded-xl border border-gray-800 hover:border-hb-gold transition-colors duration-500">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                style={{ backgroundImage: `url(${col.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hb-black via-hb-black/40 to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <h2 className="text-white text-xl font-light uppercase tracking-widest mb-3 group-hover:text-hb-gold transition-colors">
                  {col.nome}
                </h2>
                <span className="inline-block border border-white/50 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 group-hover:bg-hb-gold group-hover:text-hb-black group-hover:border-hb-gold transition-all duration-300">
                  Explorar
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}