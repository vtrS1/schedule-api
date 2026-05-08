import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("usuarios")
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("super_admin", "admin")
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usuariosService.findAll({ tipo: user.tipo, bandaId: user.bandaId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("super_admin", "admin")
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("super_admin", "admin")
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: Partial<CreateUsuarioDto>) {
    return this.usuariosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("super_admin", "admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
