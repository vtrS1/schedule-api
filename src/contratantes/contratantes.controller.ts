import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from "@nestjs/common";
import { ContratantesService } from "./contratantes.service";
import { CreateContratanteDto } from "./dto/create-contratante.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("contratantes")
export class ContratantesController {
  constructor(private readonly svc: ContratantesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin", "vendedor", "artista_vendedor")
  create(@Body() dto: CreateContratanteDto, @CurrentUser() user: any) {
    return this.svc.create(dto, { tipo: user.tipo, bandaId: user.bandaId });
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.svc.findAll({ tipo: user.tipo, bandaId: user.bandaId });
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: Partial<CreateContratanteDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
