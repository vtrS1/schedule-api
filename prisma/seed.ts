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

  // --- Super Admin ----------------------------------------------------------
  const hash = await bcrypt.hash("admin123", 10);
  const superAdmin = await prisma.usuario.upsert({
    where: { cpf: "00000000000" },
    update: { tipo: "super_admin", nome: "Super Administrador" },
    create: { nome: "Super Administrador", cpf: "00000000000", senha: hash, tipo: "super_admin", bandaId: null },
  });
  console.log("Super Admin:", superAdmin.nome, "| CPF: 00000000000 | Senha: admin123");

  // --- Categorias de Despesa (globais) --------------------------------------
  const categorias = ["Passagem", "Hotel", "Alimentacao", "Rider Tecnico", "Transporte", "Marketing"];
  const categoriasDb: any[] = [];
  for (const nome of categorias) {
    const cat = await prisma.categoriaDespesa.upsert({
      where: { id: (await prisma.categoriaDespesa.findFirst({ where: { nome, bandaId: null } }))?.id ?? 0 },
      update: {},
      create: { nome, bandaId: null },
    });
    categoriasDb.push(cat);
  }
  console.log("Categorias de despesa criadas:", categoriasDb.map((c: any) => c.nome).join(", "));

  // --- Buscar eventos aprovados existentes ---------------------------------
  const eventos = await prisma.evento.findMany({ where: { status: "aprovado" } });

  if (eventos.length === 0) {
    console.log("Nenhum evento aprovado encontrado. Pulando seed financeiro.");
  } else {
    console.log(`Inserindo dados financeiros em ${eventos.length} evento(s) aprovado(s)...`);

    const catPassagem = categoriasDb.find((c: any) => c.nome === "Passagem");
    const catHotel    = categoriasDb.find((c: any) => c.nome === "Hotel");
    const catRider    = categoriasDb.find((c: any) => c.nome === "Rider Tecnico");

    for (let i = 0; i < eventos.length; i++) {
      const ev = eventos[i];

      // Limpar dados anteriores para não duplicar
      await prisma.despesa.deleteMany({ where: { eventoId: ev.id } });
      await prisma.pagamento.deleteMany({ where: { eventoId: ev.id } });

      // Despesas variadas por evento
      const despesasSeed = [
        { categoriaId: catPassagem.id, descricao: "Passagem aerea ida/volta", valor: Math.round(ev.valor * 0.05 * 100) / 100 },
        { categoriaId: catHotel.id,    descricao: "Hospedagem 1 diaria",      valor: Math.round(ev.valor * 0.03 * 100) / 100 },
      ];
      if (i % 2 === 0) {
        despesasSeed.push({ categoriaId: catRider.id, descricao: "Rider tecnico completo", valor: Math.round(ev.valor * 0.04 * 100) / 100 });
      }
      for (const d of despesasSeed) {
        await prisma.despesa.create({ data: { eventoId: ev.id, ...d } });
      }

      // Pagamento: alguns com adiantamento + saldo, outros total
      if (i % 3 === 0) {
        // Adiantamento 50% recebido
        await prisma.pagamento.create({
          data: {
            eventoId: ev.id, tipo: "adiantamento", forma: "pix",
            percentual: 50, valor: Math.round(ev.valor * 0.5 * 100) / 100,
            status: "recebido", dataPagamento: new Date(new Date(ev.data).getTime() - 7 * 86400000),
            observacao: "Adiantamento via PIX",
          },
        });
        // Saldo 50% pendente
        await prisma.pagamento.create({
          data: {
            eventoId: ev.id, tipo: "saldo", forma: "ted",
            percentual: 50, valor: Math.round(ev.valor * 0.5 * 100) / 100,
            status: "pendente", observacao: "Saldo apos evento",
          },
        });
      } else if (i % 3 === 1) {
        // Total recebido
        await prisma.pagamento.create({
          data: {
            eventoId: ev.id, tipo: "total", forma: "pix",
            percentual: 100, valor: ev.valor,
            status: "recebido", dataPagamento: new Date(ev.data),
            observacao: "Pagamento total no dia do evento",
          },
        });
      } else {
        // Adiantamento recebido + saldo pendente
        await prisma.pagamento.create({
          data: {
            eventoId: ev.id, tipo: "adiantamento", forma: "dinheiro",
            percentual: 50, valor: Math.round(ev.valor * 0.5 * 100) / 100,
            status: "recebido", dataPagamento: new Date(new Date(ev.data).getTime() - 3 * 86400000),
          },
        });
        await prisma.pagamento.create({
          data: {
            eventoId: ev.id, tipo: "saldo", forma: "pix",
            percentual: 50, valor: Math.round(ev.valor * 0.5 * 100) / 100,
            status: "pendente",
          },
        });
      }

      // NF em metade dos eventos
      if (i % 2 === 0) {
        await prisma.evento.update({
          where: { id: ev.id },
          data: { numeroNF: `NF-${String(2024000 + ev.id).padStart(7, "0")}` },
        });
      }

      console.log(`  Evento #${ev.id} (R$ ${ev.valor}) - despesas e pagamentos inseridos`);
    }
  }

  console.log("\nSeed concluido!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
