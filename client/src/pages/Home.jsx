import React from 'react'
import { Link } from 'react-router-dom'
import { getAccessToken } from '../store/auth'

export default function Home() {
  const logged = !!getAccessToken()

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-slate-800 bg-slate-900/80 p-10 shadow-2xl backdrop-blur">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              CRUDTeuz
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
              Sistema de autenticacao segura com CRUD completo e rotas protegidas.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Projeto de portfolio desenvolvido com persistencia de sessao por token, validacao de acesso e boas praticas de arquitetura para aplicacoes web.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={logged ? '/dashboard' : '/login'} className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500">
                {logged ? 'Ir para o Dashboard' : 'Entrar no Sistema'}
              </Link>
              {!logged && (
                <Link to="/register" className="rounded-2xl border border-slate-700 bg-slate-950/60 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-900">
                  Registrar
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-6">
            <h2 className="text-lg font-semibold text-white">Registro e login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Validacao clara de formulario, mensagens visiveis e sessao persistente.</p>
          </article>
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-6">
            <h2 className="text-lg font-semibold text-white">Seguranca</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Rotas autenticadas, refresh token e controle correto de permissoes.</p>
          </article>
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-6">
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Criacao, listagem, edicao e exclusao de registros apos login.</p>
          </article>
        </section>
      </div>
    </div>
  )
}
