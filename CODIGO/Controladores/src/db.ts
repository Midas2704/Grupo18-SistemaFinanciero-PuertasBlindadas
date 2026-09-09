import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Midas2704@localhost:5433/pblindadas_finanzas?schema=finanzas";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

// Patch para serializar BigInt a String en JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
