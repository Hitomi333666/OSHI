import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // 開発時にクエリログを出力（必要に応じて削除）
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
