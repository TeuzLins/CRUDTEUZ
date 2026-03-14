import { useState } from 'react'
import { z } from 'zod'
import { api } from '../api/axios'
import { setTokens } from '../store/auth'
import { useNavigate } from 'react-router-dom'

const schema = z.object({ email: z.string().email(), password: z.string().min(8) })

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      setError('Dados inválidos')
      return
    }
    setError('')
    const { data } = await api.post('/auth/login', parsed.data)
    setTokens(data.accessToken, data.refreshToken)
    navigate('/')
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" className="w-full border p-2 rounded" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Entrar</button>
      </form>
    </div>
  )
}
