import { PrismaClient } from "../generated/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

let prisma;

if (process.env.NODE_ENV === "production") {
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const url = `file:${dbPath}`;
  const adapter = new PrismaBetterSqlite3({ url });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.cachedPrisma) {
    const dbPath = path.resolve(process.cwd(), "dev.db");
    const url = `file:${dbPath}`;
    const adapter = new PrismaBetterSqlite3({ url });
    global.cachedPrisma = new PrismaClient({ adapter });
  }
  prisma = global.cachedPrisma;
}

export { prisma };
