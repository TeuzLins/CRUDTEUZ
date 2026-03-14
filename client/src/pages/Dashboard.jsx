import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import Pagination from '../components/Pagination'
import { api } from '../api/axios'
import { clearTokens } from '../store/auth'

function Notice({ tone = 'info', message }) {
  if (!message) return null

  const styles = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200'
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone] || styles.info}`} role="alert" aria-live="polite">
      {message}
    </div>
  )
}

const emptyForm = { name: '', email: '', password: '', role: 'USER' }

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loadingMe, setLoadingMe] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingForm, setEditingForm] = useState({ id: null, name: '', email: '', role: 'USER' })
  const [deleteId, setDeleteId] = useState(null)
  const [notice, setNotice] = useState({ tone: 'info', message: '' })
  const [createError, setCreateError] = useState('')
  const [view, setView] = useState('dashboard')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      setNotice({ tone: 'success', message: location.state.message })
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const { data } = await api.get('/auth/me')
        if (!active) return
        setMe(data)
      } catch {
        if (!active) return
        clearTokens()
        navigate('/login', { replace: true })
        return
      } finally {
        if (active) setLoadingMe(false)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [navigate])

  useEffect(() => {
    if (me?.role === 'ADMIN') {
      loadUsers(1)
    }
  }, [me])

  async function loadUsers(nextPage = 1) {
    setLoadingUsers(true)
    try {
      const { data } = await api.get(`/users?page=${nextPage}&limit=10`)
      setUsers(data.data || [])
      setPage(data.meta?.page || nextPage)
      setPages(data.meta?.pages || 1)
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error?.response?.data?.message || 'Não foi possível carregar os registros.'
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  function validateUserForm(form, requirePassword = true) {
    if (!form.name.trim() || !form.email.trim()) return 'Nome e email são obrigatórios.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Informe um e-mail válido.'
    if (requirePassword && (!form.password || form.password.length < 8)) return 'A senha deve ter pelo menos 8 caracteres.'
    return ''
  }

  async function createUser() {
    const message = validateUserForm(createForm, true)
    if (message) {
      setCreateError(message)
      return
    }

    setCreateError('')

    try {
      await api.post('/users', {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role
      })
      setCreateForm(emptyForm)
      setNotice({ tone: 'success', message: 'Registro criado com sucesso!' })
      await loadUsers(page)
    } catch (error) {
      setCreateError(error?.response?.data?.message || 'Falha ao criar registro.')
    }
  }

  function startEdit(user) {
    setEditingId(user.id)
    setEditingForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  }

  async function saveEdit() {
    const message = validateUserForm(editingForm, false)
    if (message) {
      setNotice({ tone: 'error', message })
      return
    }

    try {
      await api.put(`/users/${editingForm.id}`, {
        name: editingForm.name.trim(),
        email: editingForm.email.trim(),
        role: editingForm.role
      })
      setEditingId(null)
      setNotice({ tone: 'success', message: 'Registro atualizado com sucesso!' })
      await loadUsers(page)
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error?.response?.data?.message || 'Falha ao atualizar registro.'
      })
    }
  }

  async function performDelete() {
    try {
      await api.delete(`/users/${deleteId}`)
      setDeleteId(null)
      setNotice({ tone: 'success', message: 'Registro excluído com sucesso!' })
      await loadUsers(page)
    } catch (error) {
      setDeleteId(null)
      setNotice({
        tone: 'error',
        message: error?.response?.data?.message || 'Falha ao excluir registro.'
      })
    }
  }

  async function createFromRegisterView(event) {
    event.preventDefault()

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password || !registerForm.confirm) {
      setNotice({ tone: 'error', message: 'Preencha todos os campos do registro.' })
      return
    }

    if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      setNotice({ tone: 'error', message: 'Informe um e-mail válido.' })
      return
    }

    if (registerForm.password.length < 8) {
      setNotice({ tone: 'error', message: 'A senha deve ter pelo menos 8 caracteres.' })
      return
    }

    if (registerForm.password !== registerForm.confirm) {
      setNotice({ tone: 'error', message: 'As senhas não coincidem.' })
      return
    }

    try {
      await api.post('/users', {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        role: 'USER'
      })
      setRegisterForm({ name: '', email: '', password: '', confirm: '' })
      setView('dashboard')
      setNotice({ tone: 'success', message: 'Registro criado com sucesso' })
      await loadUsers(1)
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error?.response?.data?.message || 'Falha ao registrar usuário.'
      })
    }
  }

  function logout() {
    clearTokens()
    navigate('/login', { replace: true })
  }

  const total = users.length
  const recent = useMemo(() => users[0]?.name || '-', [users])
  const status = loadingMe ? 'Validando sessão...' : (me ? 'Operacional' : 'Aguardando login')
  const registerErrors = {
    name: registerForm.name && registerForm.name.trim().length < 2 ? 'Nome deve ter ao menos 2 caracteres' : '',
    email: registerForm.email && !/\S+@\S+\.\S+/.test(registerForm.email) ? 'E-mail inválido' : '',
    password: registerForm.password && registerForm.password.length < 8 ? 'A senha deve conter pelo menos 8 caracteres' : '',
    confirm: registerForm.confirm && registerForm.confirm !== registerForm.password ? 'As senhas não coincidem' : ''
  }
  const registerValid = registerForm.name.trim().length >= 2
    && /\S+@\S+\.\S+/.test(registerForm.email)
    && registerForm.password.length >= 8
    && registerForm.confirm === registerForm.password

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Dashboard</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">Painel autenticado</h1>
              <p className="mt-2 text-sm text-slate-400">Acesso protegido por token e operações CRUD liberadas para usuários autenticados com permissão.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {me?.role === 'ADMIN' && (
                <button onClick={() => setView('register')} className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 font-semibold text-violet-200 transition hover:bg-violet-500/20">
                  Criar Registro
                </button>
              )}
              <button onClick={logout} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-900">
                Sair
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-5">
            <div className="text-sm text-slate-400">Total de registros</div>
            <div className="mt-3 text-3xl font-semibold text-white">{total}</div>
          </article>
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-5">
            <div className="text-sm text-slate-400">Atividade recente</div>
            <div className="mt-3 text-3xl font-semibold text-white">{recent}</div>
          </article>
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-5">
            <div className="text-sm text-slate-400">Status do sistema</div>
            <div className="mt-3 text-3xl font-semibold text-white">{status}</div>
          </article>
        </section>

        <Notice tone={notice.tone} message={notice.message} />

        {view === 'register' && me?.role === 'ADMIN' && (
          <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-white">Registrar Usuário</h2>
              <button onClick={() => setView('dashboard')} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200">
                Voltar
              </button>
            </div>

            <form onSubmit={createFromRegisterView} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Nome completo" name="register-name" value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do usuario" error={registerErrors.name} />
              <Input label="Email" name="register-email" type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} placeholder="usuario@empresa.com" error={registerErrors.email} />
              <Input label="Senha" name="register-password" type="password" value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} placeholder="Senha" error={registerErrors.password} />
              <Input label="Confirmar Senha" name="register-confirm" type="password" value={registerForm.confirm} onChange={(event) => setRegisterForm((current) => ({ ...current, confirm: event.target.value }))} placeholder="Repita a senha" error={registerErrors.confirm} />
              <div className="md:col-span-2 max-w-xs">
                <Button type="submit" disabled={!registerValid}>Registrar</Button>
              </div>
            </form>
          </section>
        )}

        {view !== 'register' && (
        <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
          <article className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Minha conta</h2>
            {me ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-sm text-slate-400">Nome</div>
                  <div className="mt-1 text-lg font-medium text-white">{me.name}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="mt-1 text-lg font-medium text-white">{me.email}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-sm text-slate-400">Perfil</div>
                  <div className="mt-1 text-lg font-medium text-white">{me.role}</div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">Carregando dados da sessão...</p>
            )}
          </article>

          {me?.role === 'ADMIN' ? (
            <article className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Criar registro</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="Nome" value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome" />
                <Input label="Email" type="email" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
                <Input label="Senha" type="password" value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} placeholder="Senha" />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-200">Perfil</label>
                  <select value={createForm.role} onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))} className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 text-slate-100">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="w-full max-w-xs">
                  <Button onClick={createUser}>Criar</Button>
                </div>
                {createError && <span className="text-sm text-rose-300">{createError}</span>}
              </div>
            </article>
          ) : (
            <article className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Acesso ao CRUD</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Seu usuário está autenticado. O CRUD administrativo fica disponível para perfis com permissão ADMIN.
              </p>
            </article>
          )}
        </section>
        )}

        {me?.role === 'ADMIN' && view !== 'register' && (
          <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-white">Registros</h2>
              {loadingUsers && <span className="text-sm text-slate-400">Carregando...</span>}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-3 py-3">Nome</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Perfil</th>
                    <th className="px-3 py-3">Criado em</th>
                    <th className="px-3 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="text-slate-200">
                      <td className="px-3 py-3">
                        {editingId === user.id ? (
                          <input value={editingForm.name} onChange={(event) => setEditingForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100" />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {editingId === user.id ? (
                          <input value={editingForm.email} onChange={(event) => setEditingForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100" />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {editingId === user.id ? (
                          <select value={editingForm.role} onChange={(event) => setEditingForm((current) => ({ ...current, role: event.target.value }))} className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          {editingId === user.id ? (
                            <>
                              <button onClick={saveEdit} className="rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500">Salvar</button>
                              <button onClick={() => setEditingId(null)} className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 font-semibold text-slate-200">Cancelar</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(user)} className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-500">Editar</button>
                              <button onClick={() => setDeleteId(user.id)} className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-semibold text-rose-200 hover:bg-rose-500/20">Excluir</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination page={page} pages={pages} onChange={(nextPage) => loadUsers(nextPage)} />
            </div>
          </section>
        )}

        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white">Confirmar exclusão</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Tem certeza que deseja excluir este registro?</p>
              <div className="mt-6 flex gap-3">
                <button onClick={performDelete} className="rounded-2xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-500">Excluir</button>
                <button onClick={() => setDeleteId(null)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 font-semibold text-slate-200">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
