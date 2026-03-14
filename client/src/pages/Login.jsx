import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { api } from '../api/axios'
import { getAccessToken, getRememberPreference, setRememberPreference, setTokens } from '../store/auth'

function Feedback({ tone, message }) {
  if (!message) return null
  const styles = tone === 'success'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`} role="alert" aria-live="polite">
      {message}
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(getRememberPreference())
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [feedback, setFeedback] = useState({ tone: 'error', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (getAccessToken()) navigate('/dashboard', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (location.state?.message) {
      setFeedback({ tone: 'success', message: location.state.message })
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  function validate() {
    const nextErrors = { email: '', password: '' }

    if (!email.trim()) nextErrors.email = 'Campo obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = 'Informe um e-mail válido'

    if (!password) nextErrors.password = 'Campo obrigatório'
    else if (password.length < 8) nextErrors.password = 'A senha deve ter pelo menos 8 caracteres'

    setErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) {
      setFeedback({ tone: 'error', message: 'Preencha os campos obrigatórios corretamente.' })
      return false
    }

    return true
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setFeedback({ tone: 'error', message: '' })
    setRememberPreference(remember)

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password
      })

      setTokens(data.accessToken, data.refreshToken)
      setFeedback({ tone: 'success', message: 'Login realizado com sucesso.' })
      navigate('/dashboard', {
        replace: true,
        state: { message: 'Login realizado com sucesso.' }
      })
    } catch (error) {
      const status = error?.response?.status
      const apiMessage = error?.response?.data?.message

      let message = 'Erro ao realizar login.'
      if (status === 401) message = 'E-mail ou senha inválidos.'
      else if (status === 400) message = 'Revise os campos obrigatórios.'
      else if (apiMessage) message = apiMessage

      setFeedback({ tone: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Painel Seguro
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white">Autenticação e CRUD em um fluxo único.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Entre para acessar o painel, manter a sessão ativa e administrar registros com create, read, update e delete protegidos por token.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-sm text-slate-400">Autenticação</div>
              <div className="mt-2 text-lg font-semibold text-white">Registro e login</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-sm text-slate-400">Sessao</div>
              <div className="mt-2 text-lg font-semibold text-white">Token com refresh</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-sm text-slate-400">Operacoes</div>
              <div className="mt-2 text-lg font-semibold text-white">CRUD protegido</div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/85 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-400">Use sua conta para acessar o dashboard.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Input label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" error={errors.email} />
            <Input label="Senha" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" error={errors.password} />

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 accent-blue-500"
              />
              Manter sessão neste dispositivo
            </label>

            <Feedback tone={feedback.tone} message={feedback.message} />

            <Button type="submit" loading={loading}>Entrar</Button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Não tem conta?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
              Registrar
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
