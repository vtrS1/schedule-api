import { Module } from '@nestjs/common';
import { ArtistasController } from './artistas.controller';
import { ArtistasService } from './artistas.service';

@Module({
  controllers: [ArtistasController],
  providers: [ArtistasService],
})
export class ArtistasModule {}
