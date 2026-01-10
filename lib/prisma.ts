import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  console.log(
    "Creating Prisma client with connection:",
    connectionString.replace(/:[^:@]+@/, ":***@")
  );

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  pool.on("error", (err) => {
    console.error("Database pool error:", err);
  });

  pool.on("connect", () => {
    console.log("Database connected successfully");
  });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  return client;
};

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
