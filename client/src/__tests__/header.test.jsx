import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as matchers from '@testing-library/jest-dom/matchers'
import App from '../App'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

function renderAt(pathname = '/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
    </MemoryRouter>
  )
}

describe('Header interatividade', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('links do header navegam na Home', async () => {
    renderAt('/')
    const loginLink = screen.getByRole('link', { name: /login/i })
    await userEvent.click(loginLink)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('links do header navegam mesmo com overlay wave na Login', async () => {
    renderAt('/login')
    const registerLink = screen.getAllByRole('link', { name: /registrar/i })[0]
    await userEvent.click(registerLink)
    expect(screen.getByRole('heading', { name: /registrar/i })).toBeInTheDocument()
  })

  it('dashboard protegido: sem token redireciona para login', () => {
    renderAt('/dashboard')
    expect(screen.getAllByRole('heading', { name: /login/i })[0]).toBeInTheDocument()
  })

  it('dashboard acessivel com token', async () => {
    localStorage.setItem('access_token', 'fake')
    renderAt('/dashboard')
    expect(screen.getByText(/status do sistema/i)).toBeInTheDocument()
  })
})
