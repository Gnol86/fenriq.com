// src/lib/prisma-client.js
import { PrismaClient } from "@root/prisma/generated";

// Instance singleton de PrismaClient avec configuration de logging
// Cette instance est partagée dans toute l'application pour éviter les connexions multiples
const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV !== "production"
                ? [
                      { emit: "stdout", level: "query" },
                      { emit: "stdout", level: "info" },
                      { emit: "stdout", level: "warn" },
                      { emit: "stdout", level: "error" },
                  ]
                : [],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
