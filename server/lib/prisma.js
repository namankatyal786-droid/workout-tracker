import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// Singleton PrismaClient instance taaki database connection pool efficiently manage ho
// Viva note: Prisma ORM PostgreSQL connection ke liye internal pooling use karta hai.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
