import { Module } from '@nestjs/common';
import { ContratantesService } from './contratantes.service';
import { ContratantesController } from './contratantes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContratantesController],
  providers: [ContratantesService],
  exports: [ContratantesService],
})
export class ContratantesModule {}
