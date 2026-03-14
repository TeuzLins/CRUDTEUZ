import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function ensureDatabaseSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "RefreshToken" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "tokenHash" TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "expiresAt" DATETIME NOT NULL,
      "revoked" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RefreshToken_userId_tokenHash_idx" ON "RefreshToken"("userId", "tokenHash")`)
}
