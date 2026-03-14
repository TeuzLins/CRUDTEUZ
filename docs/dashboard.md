# Dashboard: Arquitetura e Fluxo

## Arquitetura
- Frontend: React 18 + Vite + TailwindCSS
- Roteamento: `react-router-dom`
- HTTP: Axios com interceptadores e refresh token
- Estado de sessão: `localStorage`/`sessionStorage` via `client/src/store/auth.ts`
- Backend: Express + Prisma (SQLite) + Zod + JWT

## Fluxo de Dados
1. Autenticação
   - Login/Registro chamam `/auth/login` e `/auth/register` (`client/src/pages/Login.jsx`, `client/src/pages/Register.jsx`)
   - Tokens são persistidos conforme “Lembrar-me” (`client/src/store/auth.ts`)
   - `GET /auth/me` identifica o usuário ao abrir a Dashboard (`client/src/pages/Dashboard.jsx`)
2. CRUD de Usuários (somente ADMIN)
   - Listagem: `GET /users?page=...&limit=...`
   - Criação: `POST /users` (name, email, password, role)
   - Atualização: `PUT /users/:id` (ADMIN ou dono)
   - Exclusão: `DELETE /users/:id` (ADMIN)
3. Interceptadores
   - `client/src/api/axios.ts` injeta `Authorization` e faz refresh em 401

## Dependências
- Frontend: `react`, `react-router-dom`, `axios`, `zod`, `tailwindcss`
- Dev/Test: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
- Backend: `express`, `@prisma/client`, `prisma`, `bcryptjs`, `jsonwebtoken`, `zod`

## Configurações
- Client `.env`: `VITE_API_URL=http://localhost:4000/api`
- Server `.env`: `PORT=4000`, `JWT_SECRET`, `DATABASE_URL` (SQLite)
- Prisma: `server/prisma/schema.prisma` e migrações em `server/prisma/migrations`

## Como Rodar
1. Backend
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - `npm run dev`
2. Frontend
   - `npm install`
   - `npm run dev`
   - Abrir `http://localhost:5173`

## Testes
- Rodar: `npm run test` no `client`
- Cobertura:
  - Header: navegação e interação com overlay (`client/src/__tests__/header.test.jsx`)
  - Dashboard: renderização, CRUD e proteção de rota (`client/src/__tests__/dashboard.test.jsx`)

## Acessibilidade e Responsividade
- Foco visível (`focus-visible:ring`), contraste e labels/aria nos inputs
- Alvos de clique ≥ 48×48 e navegação por teclado/touch
- Responsivo com grid/flex e breakpoints (
  Home, Login, Registro, Dashboard)

## Notas de Produção
- Build: `client` com `npm run build` e `npm run preview`
- Verificar CORS e variáveis de ambiente no server
- Validar tempo de carregamento (< 2s em páginas simples) e ausência de erros no console

