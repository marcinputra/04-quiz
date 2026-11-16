import { PrismaClient } from "@prisma/client";

// Jedna instancja klienta na cały proces
export const prisma = new PrismaClient();
