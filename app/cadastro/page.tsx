'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react'

export default function PaginaCadastro() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  // ⭐ ADICIONADO: Estado para controlar o aceite dos termos
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [erroTermos, setErroTermos] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ⭐ ADICIONADO: Trava de segurança para os Termos
    if (!aceitouTermos) {
      setErroTermos(true)
      return
    }

    setErroTermos(false)
    setCarregando(true)

    try {
      // Exemplo de chamada para sua API de criação de usuário
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      })

      if (res.ok) {
        // Redireciona para login ou direto para o painel após sucesso
        router.push('/login?sucesso=true')
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao criar conta.")
      }
    } catch (error) {
      alert("Erro de conexão.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-900 uppercase tracking-widest italic mb-2">
            Criar Conta
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Junte-se à experiência HB Importados
          </p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Nome Completo
            </label>
            <input 
              type="text" 
              required 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded text-sm outline-none focus:border-black transition"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              E-mail
            </label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded text-sm outline-none focus:border-black transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Senha
            </label>
            <input 
              type="password" 
              required 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded text-sm outline-none focus:border-black transition"
              placeholder="••••••••"
            />
          </div>

          {/* ⭐ ADICIONADO: Checkbox de Aceite de Termos */}
          <div className="pt-2">
            <label className={`flex items-start gap-3 p-3 rounded cursor-pointer border transition-all ${erroTermos ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  checked={aceitouTermos}
                  onChange={(e) => {
                    setAceitouTermos(e.target.checked)
                    if (e.target.checked) setErroTermos(false)
                  }}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black cursor-pointer" 
                />
              </div>
              <div className="flex-1 text-[10px] text-gray-500 leading-tight">
                Eu li e concordo com os{' '}
                <Link href="/termos" className="font-bold text-black hover:underline">Termos de Uso</Link> 
                {' '}e a{' '}
                <Link href="/privacidade" className="font-bold text-black hover:underline">Política de Privacidade</Link>.
              </div>
            </label>
            {erroTermos && (
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                <ShieldCheck size={12} /> É necessário aceitar os termos para continuar
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={carregando || !aceitouTermos}
            className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? <Loader2 size={16} className="animate-spin" /> : <>Criar Minha Conta <ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-500">
            Já possui uma conta?{' '}
            <Link href="/login" className="font-bold text-black uppercase tracking-widest hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}