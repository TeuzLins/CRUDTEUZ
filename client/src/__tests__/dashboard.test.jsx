import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen, within } from '@testing-library/react'
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

describe('Dashboard funcional', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.resetAllMocks()
  })

  it('redireciona para login sem token', async () => {
    renderAt('/dashboard')
    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renderiza dados do usuario e lista de usuarios (ADMIN)', async () => {
    localStorage.setItem('access_token', 'token')

    const usersPayload = {
      data: [
        { id: 1, name: 'Ana Paula', email: 'ana@example.com', role: 'USER', createdAt: '2025-12-12T00:00:00.000Z' },
        { id: 2, name: 'Carlos Silva', email: 'carlos@example.com', role: 'USER', createdAt: '2025-12-13T00:00:00.000Z' }
      ],
      meta: { total: 2, page: 1, limit: 10, pages: 1 }
    }

    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 99, name: 'Admin', email: 'a@a.com', role: 'ADMIN' } })
      if (url.startsWith('/users')) return Promise.resolve({ data: usersPayload })
      return Promise.resolve({ data: {} })
    })

    renderAt('/dashboard')

    expect(await screen.findByText(/status do sistema/i)).toBeInTheDocument()
    expect(await screen.findByText('Admin')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /registros/i })).toBeInTheDocument()
    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBeGreaterThan(2)
  })

  it('cria, edita e exclui usuario (ADMIN)', async () => {
    localStorage.setItem('access_token', 'token')

    const usersPayload = {
      data: [
        { id: 1, name: 'Ana Paula', email: 'ana@example.com', role: 'USER', createdAt: '2025-12-12T00:00:00.000Z' }
      ],
      meta: { total: 1, page: 1, limit: 10, pages: 1 }
    }

    api.get.mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 99, name: 'Admin', email: 'a@a.com', role: 'ADMIN' } })
      if (url.startsWith('/users')) return Promise.resolve({ data: usersPayload })
      return Promise.resolve({ data: {} })
    })
    api.post.mockResolvedValue({ data: { id: 3, name: 'Novo', email: 'novo@example.com', role: 'USER', createdAt: '2025-12-14T00:00:00.000Z' } })
    api.put.mockResolvedValue({ data: { id: 1, name: 'Ana Atualizada', email: 'ana@example.com', role: 'USER' } })
    api.delete.mockResolvedValue({ data: { ok: true } })

    renderAt('/dashboard')

    const nomeInput = (await screen.findAllByLabelText(/nome/i))[0]
    const emailInput = (await screen.findAllByLabelText(/email/i))[0]
    const senhaInput = (await screen.findAllByLabelText(/senha/i))[0]
    await userEvent.clear(nomeInput)
    await userEvent.type(nomeInput, 'Novo')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'novo@example.com')
    await userEvent.clear(senhaInput)
    await userEvent.type(senhaInput, '12345678')
    await userEvent.click(screen.getByRole('button', { name: /^criar$/i }))

    usersPayload.data.push({ id: 3, name: 'Novo', email: 'novo@example.com', role: 'USER', createdAt: '2025-12-14T00:00:00.000Z' })
    expect(await screen.findByText(/registro criado com sucesso/i)).toBeInTheDocument()

    const editButton = screen.getByRole('button', { name: /editar/i })
    await userEvent.click(editButton)
    const rows = await screen.findAllByRole('row')
    const firstRow = rows[1]
    const nameCellInput = within(firstRow).getAllByRole('textbox')[0]
    await userEvent.clear(nameCellInput)
    await userEvent.type(nameCellInput, 'Ana Atualizada')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(api.put).toHaveBeenCalled()
    expect(await screen.findByText(/registro atualizado com sucesso/i)).toBeInTheDocument()

    const deleteButton = screen.getAllByRole('button', { name: /excluir/i })[0]
    await userEvent.click(deleteButton)
    const confirm = (await screen.findAllByRole('button', { name: /excluir/i })).at(-1)
    await userEvent.click(confirm)
    expect(api.delete).toHaveBeenCalled()
    expect(await screen.findByText(/registro exclu[ií]do com sucesso/i)).toBeInTheDocument()
  })
})
