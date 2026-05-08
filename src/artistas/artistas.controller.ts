import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ArtistasService } from "./artistas.service";
import { CreateArtistaDto } from "./dto/create-artista.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("artistas")
export class ArtistasController {
  constructor(private readonly artistasService: ArtistasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  create(@Body() dto: CreateArtistaDto) {
    return this.artistasService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin", "vendedor", "artista", "artista_vendedor", "visualizador")
  findAll(@CurrentUser() user: any) {
    return this.artistasService.findAll({ tipo: user.tipo, bandaId: user.bandaId });
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.artistasService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: Partial<CreateArtistaDto>) {
    return this.artistasService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super_admin", "admin")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.artistasService.remove(id);
  }
}
