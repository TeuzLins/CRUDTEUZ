import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any
    req.user = {
      id: Number(decoded.sub),
      role: decoded.role === 'ADMIN' ? 'ADMIN' : 'USER',
      email: decoded.email,
      name: decoded.name
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
  next()
}
