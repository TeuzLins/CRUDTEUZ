import jwt from 'jsonwebtoken'

export function signAccessToken(payload: { sub: number; role: 'USER' | 'ADMIN'; email: string; name: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: process.env.JWT_EXPIRES_IN || '15m' })
}
