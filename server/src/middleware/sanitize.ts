import { FilterXSS } from 'xss'
import type { NextFunction, Request, Response } from 'express'

const xss = new FilterXSS()

function sanitizeValue(value: any): any {
  if (typeof value === 'string') return xss.process(value)
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]))
  return value
}

export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body)
  if (req.query) req.query = sanitizeValue(req.query)
  if (req.params) req.params = sanitizeValue(req.params)
  next()
}
