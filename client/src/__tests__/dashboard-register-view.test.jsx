import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as matchers from '@testing-library/jest-dom/matchers'
import App from '../App'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

vi.mock('../api/axios', () => {
  const handlers = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  return { api: handlers }
})

import { api } from '../api/axios'

function renderAt(pathname = '/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
    </MemoryRouter>
  )
}

describe('Dashboard - tela de registro via botao "Criar Registro"', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.resetAllMocks()
  })

  it('abre a tela de registro ao clicar em "Criar Registro" e valida campos', async () => {
    localStorage.setItem('access_token', 'token')

    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 99, name: 'Admin', email: 'a@a.com', role: 'ADMIN' } })
      if (url.startsWith('/users')) return Promise.resolve({ data: { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1 } } })
      return Promise.resolve({ data: {} })
    })

    renderAt('/dashboard')

    const criarRegistroBtn = await screen.findByRole('button', { name: /criar registro/i })
    await userEvent.click(criarRegistroBtn)

    expect(await screen.findByText(/registrar usu[aá]rio/i)).toBeInTheDocument()

    const nome = screen.getByLabelText(/nome completo/i)
    const email = screen.getByLabelText(/email/i)
    const senha = screen.getByLabelText(/^senha$/i)
    const confirmar = screen.getByLabelText(/confirmar senha/i)
    const registrar = screen.getByRole('button', { name: /registrar/i })

    expect(registrar).toBeDisabled()

    await userEvent.type(nome, 'A')
    await userEvent.type(email, 'invalido')
    await userEvent.type(senha, '1234567')
    await userEvent.type(confirmar, '12345678')

    expect(await screen.findByText(/nome deve ter ao menos 2 caracteres/i)).toBeInTheDocument()
    expect(await screen.findByText(/e-mail inv[aá]lido/i)).toBeInTheDocument()
    expect(await screen.findAllByText(/a senha deve conter pelo menos 8 caracteres/i)).toHaveLength(1)
    expect(await screen.findByText(/as senhas n[aã]o coincidem/i)).toBeInTheDocument()

    await userEvent.clear(nome)
    await userEvent.type(nome, 'Novo Usuario')
    await userEvent.clear(email)
    await userEvent.type(email, 'novo@example.com')
    await userEvent.clear(senha)
    await userEvent.type(senha, '12345678')
    await userEvent.clear(confirmar)
    await userEvent.type(confirmar, '12345678')

    expect(registrar).not.toBeDisabled()

    await userEvent.click(registrar)
    expect(await screen.findByText(/registro criado com sucesso/i)).toBeInTheDocument()
  })
})
