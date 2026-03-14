import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { api } from '../api/axios'
import { setRememberPreference, setTokens } from '../store/auth'

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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirm: '' })
  const [feedback, setFeedback] = useState({ tone: 'error', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const nextErrors = { name: '', email: '', password: '', confirm: '' }

    if (!form.name.trim()) nextErrors.name = 'Campo obrigatório'
    else if (form.name.trim().length < 2) nextErrors.name = 'Informe ao menos 2 caracteres'

    if (!form.email.trim()) nextErrors.email = 'Campo obrigatório'
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Informe um e-mail válido'

    if (!form.password) nextErrors.password = 'Campo obrigatório'
    else if (form.password.length < 8) nextErrors.password = 'A senha deve ter pelo menos 8 caracteres'

    if (!form.confirm) nextErrors.confirm = 'Campo obrigatório'
    else if (form.confirm !== form.password) nextErrors.confirm = 'As senhas não coincidem'

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setFeedback({ tone: 'error', message: 'Revise os campos obrigatórios antes de continuar.' })
      return false
    }

    return true
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setFeedback({ tone: 'error', message: '' })
    setRememberPreference(true)

    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      })

      setTokens(data.accessToken, data.refreshToken)
      navigate('/dashboard', {
        replace: true,
        state: { message: 'Conta criada com sucesso.' }
      })
    } catch (error) {
      const status = error?.response?.status
      const apiMessage = error?.response?.data?.message

      let message = 'Erro ao criar conta.'
      if (status === 409) message = 'Este e-mail já está cadastrado.'
      else if (status === 400) message = 'Os dados enviados são inválidos.'
      else if (apiMessage) message = apiMessage

      setFeedback({ tone: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <div className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Cadastro
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white">Crie a primeira conta e libere o painel.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            O primeiro usuário registrado recebe permissão administrativa para iniciar o CRUD. Os próximos entram como usuários padrão.
          </p>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/85 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-3xl font-semibold text-white">Registrar</h2>
          <p className="mt-2 text-sm text-slate-400">Cadastre-se para acessar o sistema.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Input label="Nome" name="name" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Seu nome" error={errors.name} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="voce@empresa.com" error={errors.email} />
            <Input label="Senha" name="password" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Crie uma senha" error={errors.password} />
            <Input label="Confirmar Senha" name="confirm" type="password" value={form.confirm} onChange={(event) => updateField('confirm', event.target.value)} placeholder="Repita a senha" error={errors.confirm} />

            <Feedback tone={feedback.tone} message={feedback.message} />

            <Button type="submit" loading={loading}>Criar conta</Button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Já possui conta?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Fazer login
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
