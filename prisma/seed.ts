import "dotenv/config";
import { Pool } from "pg";
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  // Super Admin - sem bandaId, ve tudo
  const hash = await bcrypt.hash("admin123", 10);
  const superAdmin = await prisma.usuario.upsert({
    where: { cpf: "00000000000" },
    update: { tipo: "super_admin", nome: "Super Administrador" },
    create: { nome: "Super Administrador", cpf: "00000000000", senha: hash, tipo: "super_admin", bandaId: null },
  });
  console.log("Super Admin:", superAdmin.nome, "| CPF: 00000000000 | Senha: admin123");
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end(); });
