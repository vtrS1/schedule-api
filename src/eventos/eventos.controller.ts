import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private eventosService: EventosService) {}

  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor', 'artista_vendedor')
  @Post()
  create(@Body() dto: CreateEventoDto, @CurrentUser() user: any) {
    return this.eventosService.create(dto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.eventosService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventosService.findOne(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/aprovar')
  aprovar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.aprovar(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/recusar')
  recusar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.recusar(id);
  }
}
