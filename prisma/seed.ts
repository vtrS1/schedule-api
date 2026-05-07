import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin padrão
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: {
      nome: 'Administrador',
      cpf: '00000000000',
      senha: senhaAdmin,
      tipo: 'admin',
    },
  });

  console.log('✅ Admin criado:', admin.nome, '| CPF: 00000000000 | Senha: admin123');

  // Artista de exemplo
  const senhaArtista = await bcrypt.hash('artista123', 10);
  const usuarioArtista = await prisma.usuario.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: {
      nome: 'João Silva',
      cpf: '11111111111',
      senha: senhaArtista,
      tipo: 'artista',
    },
  });

  await prisma.artista.upsert({
    where: { usuarioId: usuarioArtista.id },
    update: {},
    create: {
      nome: 'João Silva',
      usuarioId: usuarioArtista.id,
    },
  });

  console.log('✅ Artista criado: João Silva | CPF: 11111111111 | Senha: artista123');

  // Vendedor de exemplo
  const senhaVendedor = await bcrypt.hash('vendedor123', 10);
  await prisma.usuario.upsert({
    where: { cpf: '22222222222' },
    update: {},
    create: {
      nome: 'Maria Vendedora',
      cpf: '22222222222',
      senha: senhaVendedor,
      tipo: 'vendedor',
    },
  });

  console.log('✅ Vendedor criado: Maria Vendedora | CPF: 22222222222 | Senha: vendedor123');

  console.log('\n🎵 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

