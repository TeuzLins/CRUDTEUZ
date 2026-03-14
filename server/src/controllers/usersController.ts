import { prisma } from '../config/prisma'
import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { createUserSchema, updateUserSchema } from '../validators/user'

export async function listUsers(req: Request, res: Response) {
  const page = parseInt((req.query.page as string) || '1', 10)
  const limit = parseInt((req.query.limit as string) || '10', 10)
  const skip = (page - 1) * limit
  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, createdAt: true } })
  ])
  const pages = Math.ceil(total / limit)
  return res.json({ data: users, meta: { total, page, limit, pages } })
}

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() })
  const { name, email, password, role } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email already exists' })
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hash, role: role || 'USER' } })
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role })
}

export async function getUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } })
  if (!user) return res.status(404).json({ message: 'Not found' })
  if (req.user?.role !== 'ADMIN' && req.user?.id !== id) return res.status(403).json({ message: 'Forbidden' })
  return res.json(user)
}

export async function updateUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return res.status(404).json({ message: 'Not found' })
  if (req.user?.role !== 'ADMIN' && req.user?.id !== id) return res.status(403).json({ message: 'Forbidden' })
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() })
  const data: any = {}
  if (parsed.data.name !== undefined) data.name = parsed.data.name
  if (parsed.data.email !== undefined) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (existing && existing.id !== id) return res.status(409).json({ message: 'Email already exists' })
    data.email = parsed.data.email
  }
  if (parsed.data.password !== undefined) data.password = await bcrypt.hash(parsed.data.password, 10)
  if (req.user?.role === 'ADMIN' && parsed.data.role !== undefined) data.role = parsed.data.role
  const updated = await prisma.user.update({ where: { id }, data })
  return res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role })
}

export async function deleteUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10)
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
  await prisma.user.delete({ where: { id } })
  return res.json({ ok: true })
}
