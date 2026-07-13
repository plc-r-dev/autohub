import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "@/lib/generated/prisma/client"

/** Bump when Prisma schema changes so dev HMR does not keep a stale client. */
const PRISMA_CLIENT_VERSION = "20260713120000_store_settings_media"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
  prismaClientVersion?: string
}

function createPrismaClient(): PrismaClient {
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma
  const versionMatches = globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION

  if (cached && versionMatches) {
    return cached
  }

  if (cached) {
    void cached.$disconnect()
  }

  const client = createPrismaClient()

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
    globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION
  }

  return client
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, client) as unknown
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value
  },
})
