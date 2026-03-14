import { useEffect, useState } from 'react'
import { api } from '../api/axios'
import Pagination from '../components/Pagination'

type Me = { id: number; name: string; email: string; role: string }
type User = { id: number; name: string; email: string; role: string; createdAt?: string }

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })

  async function loadMe() {
    try {
      const { data } = await api.get('/auth/me')
      setMe(data)
    } catch {}
  }

  async function loadUsers(p = 1) {
    try {
      const { data } = await api.get(`/users?page=${p}&limit=10`)
      setUsers(data.data)
      setPage(data.meta.page)
      setPages(data.meta.pages)
    } catch {}
  }

  useEffect(() => {
    loadMe()
    loadUsers(1)
  }, [])

  async function createUser() {
    await api.post('/users', form)
    setForm({ name: '', email: '', password: '', role: 'USER' })
    loadUsers(page)
  }

  async function updateUser(u: User) {
    await api.put(`/users/${u.id}`, { name: u.name, email: u.email, role: u.role })
    loadUsers(page)
  }

  async function deleteUser(id: number) {
    await api.delete(`/users/${id}`)
    loadUsers(page)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Minha conta</h2>
        {!me && <div>Faça login para ver</div>}
        {me && (
          <div className="mt-2 text-sm">
            <div>Nome: {me.name}</div>
            <div>Email: {me.email}</div>
            <div>Perfil: {me.role}</div>
          </div>
        )}
      </div>

      {me?.role === 'ADMIN' && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold">Usuários</h2>
          <div className="flex items-end gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="border p-2 rounded" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border p-2 rounded" />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Senha" className="border p-2 rounded" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border p-2 rounded">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button onClick={createUser} className="px-3 py-2 bg-blue-600 text-white rounded">Criar</button>
          </div>
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-2 py-2">
                <input value={u.name} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, name: e.target.value } : x))} className="border p-1 rounded" />
                <input value={u.email} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, email: e.target.value } : x))} className="border p-1 rounded" />
                <select value={u.role} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x))} className="border p-1 rounded">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button onClick={() => updateUser(u)} className="px-3 py-1 bg-green-600 text-white rounded">Salvar</button>
                <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-red-600 text-white rounded">Excluir</button>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={(p) => loadUsers(p)} />
        </div>
      )}
    </div>
  )
}
