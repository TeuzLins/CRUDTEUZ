import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes'
import { apiLimiter } from './middleware/rateLimit'
import { sanitizeInputs } from './middleware/sanitize'
import { ensureDatabaseSchema } from './config/prisma'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }))
app.use(express.json())
app.use(sanitizeInputs)
app.use(apiLimiter)
app.use(morgan('dev'))

app.use('/api', routes)

const port = parseInt(process.env.PORT || '4000', 10)

async function start() {
  await ensureDatabaseSchema()
  app.listen(port, () => {})
}

start().catch((error) => {
  console.error('server_start_error', error)
  process.exit(1)
})
