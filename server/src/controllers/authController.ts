import { prisma } from '../config/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import type { Request, Response } from 'express'
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth'
import { signAccessToken } from '../utils/jwt'

function parseDuration(input: string): number {
  const m = input.match(/^(\d+)([smhd])$/)
  if (!m) return 7 * 24 * 60 * 60 * 1000
  const n = parseInt(m[1], 10)
  const u = m[2]
  if (u === 's') return n * 1000
  if (u === 'm') return n * 60 * 1000
  if (u === 'h') return n * 60 * 60 * 1000
  return n * 24 * 60 * 60 * 1000
}

function generateRefreshToken(userId: number) {
  const token = crypto.randomBytes(64).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + parseDuration(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'))
  return { token, tokenHash, expiresAt, userId }
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten()
    })
  }

  const { name, email, password } = parsed.data
  const userCount = await prisma.user.count()

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role: userCount === 0 ? 'ADMIN' : 'USER'
    }
  })

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role as 'USER' | 'ADMIN',
    email: user.email,
    name: user.name
  })

  const rt = generateRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      userId: rt.userId,
      tokenHash: rt.tokenHash,
      expiresAt: rt.expiresAt
    }
  })

  return res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken: rt.token
  })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten()
    })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.password)

  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role as 'USER' | 'ADMIN',
    email: user.email,
    name: user.name
  })

  const rt = generateRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      userId: rt.userId,
      tokenHash: rt.tokenHash,
      expiresAt: rt.expiresAt
    }
  })

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken: rt.token
  })
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ message: 'Not found' })
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
}

export async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() })
  const { refreshToken } = parsed.data
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } } })
  if (!record) return res.status(401).json({ message: 'Invalid refresh token' })
  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user) return res.status(401).json({ message: 'Invalid refresh token' })
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name })
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } })
  const rt = generateRefreshToken(user.id)
  await prisma.refreshToken.create({ data: { userId: rt.userId, tokenHash: rt.tokenHash, expiresAt: rt.expiresAt } })
  return res.json({ accessToken, refreshToken: rt.token })
}

export async function logout(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() })
  const tokenHash = crypto.createHash('sha256').update(parsed.data.refreshToken).digest('hex')
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash, revoked: false } })
  if (record) await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } })
  return res.json({ ok: true })
}
