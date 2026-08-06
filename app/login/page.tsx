'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react' 

export default function PaginaLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    const resultado = await signIn('credentials', {
      redirect: false,
      email: email,
      password: senha,
    })

    if (resultado?.error) {
      setErro(resultado.error)
      setCarregando(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-hb-black px-6 py-12">
      <div className="max-w-md w-full bg-hb-gray p-8 rounded-xl shadow-sm border border-gray-800">
        <h1 className="text-2xl font-light text-center text-white mb-8 tracking-widest uppercase italic">
          Acesso Restrito
        </h1>

        <form onSubmit={fazerLogin} className="space-y-6">
          {erro && (
            <div className="p-3 bg-red-900/20 text-red-500 text-sm font-medium rounded text-center border border-red-800/30">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())} 
              className="w-full bg-hb-black text-white border border-gray-700 p-3 rounded focus:outline-none focus:border-hb-gold transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Senha</label>
              <Link href="/esqueci-senha" className="text-[10px] font-bold text-hb-gold hover:text-hb-goldLight transition uppercase tracking-widest">
                Esqueceu a senha?
              </Link>
            </div>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-hb-black text-white border border-gray-700 p-3 rounded focus:outline-none focus:border-hb-gold transition"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-hb-gold text-hb-black font-bold text-xs tracking-widest uppercase py-4 rounded hover:bg-hb-goldLight transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {carregando ? (
              <><Loader2 className="animate-spin" size={16} /> ENTRANDO...</>
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-4">
            Ainda não tem uma conta?{' '}
            <Link href="/cadastro" className="text-white font-bold hover:text-hb-gold transition ml-1">
              Cadastre-se aqui
            </Link>
          </p>
          <div>
            <Link href="/" className="text-[10px] text-gray-500 font-bold hover:text-hb-gold transition tracking-[0.2em] uppercase">
              Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}