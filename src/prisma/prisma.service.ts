import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPg } = require('@prisma/adapter-pg');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // SSL só é ligado quando explicitamente pedido (ex.: banco externo à
    // rede do provedor, como Neon/Supabase, ou a Internal Database URL do
    // Render usada de fora da rede do Render). Para o Web Service falando
    // com a Internal Database URL do próprio Render, deixe DATABASE_SSL
    // fora do ambiente — a conexão já é privada e não precisa de TLS.
    const needsSsl = process.env.DATABASE_SSL === 'true';
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
