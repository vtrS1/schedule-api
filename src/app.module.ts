import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ArtistasModule } from './artistas/artistas.module';
import { EventosModule } from './eventos/eventos.module';
import { ContratantesModule } from './contratantes/contratantes.module';
import { BandasModule } from './bandas/bandas.module';
import { FinanceiroModule } from './financeiro/financeiro.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ArtistasModule,
    EventosModule,
    ContratantesModule,
    BandasModule,
    FinanceiroModule,
  ],
})
export class AppModule {}
