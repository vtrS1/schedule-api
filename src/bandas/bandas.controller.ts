import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BandasService } from './bandas.service';
import { CreateBandaDto, UpdateBandaDto } from './dto/banda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bandas')
export class BandasController {
  constructor(private readonly bandasService: BandasService) {}

  @Post()
  @Roles('super_admin')
  create(@Body() dto: CreateBandaDto) {
    return this.bandasService.create(dto);
  }

  @Get()
  @Roles('super_admin', 'admin', 'vendedor', 'artista', 'artista_vendedor', 'visualizador')
  findAll() {
    return this.bandasService.findAll();
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bandasService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBandaDto) {
    return this.bandasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bandasService.remove(id);
  }
}
