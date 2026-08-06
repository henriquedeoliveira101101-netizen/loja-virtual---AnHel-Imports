'use client'

import Link from 'next/link'
import { ShoppingBag, Search, User, Menu, X, LogOut, Shield } from 'lucide-react'
import { useCart } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const itens = useCart((state: any) => state.itens)
  const [montado, setMontado] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  
  const [termoBusca, setTermoBusca] = useState('')
  const [buscaAberta, setBuscaAberta] = useState(false)
  const router = useRouter()
  
  const { data: session } = useSession()

  useEffect(() => {
    setMontado(true)
  }, [])

  const totalItens = itens?.reduce((acc: number, item: any) => acc + item.quantidade, 0) || 0
  const fecharMenu = () => setMenuAberto(false)

  const primeiroNome = session?.user?.name?.split(' ')[0]
  const isAdmin = (session?.user as any)?.role === 'admin'

  const fazerPesquisa = (e: React.FormEvent) => {
    e.preventDefault()
    if (termoBusca.trim() !== '') {
      router.push(`/pesquisa?q=${termoBusca}`)
      setBuscaAberta(false)
      setTermoBusca('')
    }
  }

  return (
    // 🚨 Fundo Preto e Borda Chumbo
    <header className="bg-hb-black border-b border-hb-gray sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <button 
          className="md:hidden text-gray-300 hover:text-hb-gold transition"
          onClick={() => setMenuAberto(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo em Dourado */}
        <Link href="/" className="text-xl font-bold tracking-widest text-hb-gold">
          HB IMPORTADOS
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="hover:text-hb-gold transition duration-300">HOME</Link>
          <Link href="/colecoes" className="hover:text-hb-gold transition duration-300">COLEÇÕES</Link>
          <Link href="/sobre" className="hover:text-hb-gold transition duration-300">SOBRE</Link>
        </nav>

        {/* Ícones da Direita */}
        <div className="flex items-center gap-4 md:gap-5 text-gray-300">
          
          <div className="hidden sm:flex items-center relative">
            {buscaAberta ? (
              <form onSubmit={fazerPesquisa} className="flex items-center border-b border-hb-gold pb-1 animate-in slide-in-from-right-4">
                <input 
                  type="text"
                  autoFocus
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Pesquisar joias..."
                  className="outline-none text-xs w-40 text-gray-200 bg-transparent placeholder-gray-600"
                />
                <button type="submit" className="hover:text-hb-gold mr-2 transition"><Search size={16} /></button>
                <button type="button" onClick={() => setBuscaAberta(false)}><X size={16} className="text-gray-500 hover:text-red-500 transition" /></button>
              </form>
            ) : (
              <button onClick={() => setBuscaAberta(true)} className="hover:text-hb-gold transition">
                <Search size={20} />
              </button>
            )}
          </div>
          
          {session ? (
            <div className="hidden sm:flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin" className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-red-400 transition">
                  <Shield size={16} /> Admin
                </Link>
              )}
              
              <Link href="/minha-conta" className="text-xs font-medium text-gray-400 hover:text-hb-gold uppercase tracking-widest border-l border-hb-gray pl-4 ml-1 transition flex items-center gap-2">
                <User size={14} /> Olá, {primeiroNome}
              </Link>

              <button onClick={() => signOut()} className="hover:text-hb-gold transition flex items-center gap-1 text-gray-500">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block hover:text-hb-gold transition">
              <User size={20} />
            </Link>
          )}
          
          <Link href="/carrinho" className="hover:text-hb-gold transition relative ml-2">
            <ShoppingBag size={20} />
            {montado && totalItens > 0 && (
              // 🚨 Badge do carrinho invertido: Fundo Dourado e Texto Preto
              <span className="absolute -top-2 -right-2 bg-hb-gold text-hb-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {totalItens}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Menu Mobile */}
      {menuAberto && <div className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity" onClick={fecharMenu} />}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-hb-black border-r border-hb-gray z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-hb-gray">
          <span className="font-bold tracking-widest text-lg text-hb-gold">MENU</span>
          <button onClick={fecharMenu} className="text-gray-500 hover:text-hb-gold transition"><X size={24} /></button>
        </div>
        <nav className="flex flex-col p-6 gap-6 text-sm font-medium text-gray-300 tracking-widest uppercase">
          <Link href="/" onClick={fecharMenu} className="hover:text-hb-gold transition">Home</Link>
          <Link href="/colecoes" onClick={fecharMenu} className="hover:text-hb-gold transition">Coleções</Link>
          <Link href="/sobre" onClick={fecharMenu} className="hover:text-hb-gold transition">Sobre</Link>
          <div className="h-[1px] bg-hb-gray my-2"></div>
          {session ? (
            <>
              <Link href="/minha-conta" onClick={fecharMenu} className="hover:text-hb-gold transition flex items-center gap-2"><User size={16} /> Minha Conta</Link>
              {isAdmin && <Link href="/admin" onClick={fecharMenu} className="text-red-500 hover:text-red-400 transition flex items-center gap-2"><Shield size={16} /> Painel Admin</Link>}
              <button onClick={() => { signOut(); fecharMenu(); }} className="text-left text-gray-500 hover:text-hb-gold transition flex items-center gap-2"><LogOut size={16} /> Sair</button>
            </>
          ) : (
            <Link href="/login" onClick={fecharMenu} className="hover:text-hb-gold transition flex items-center gap-2"><User size={16} /> Entrar / Cadastrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}