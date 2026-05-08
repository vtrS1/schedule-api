import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateArtistaDto } from "./dto/create-artista.dto";

@Injectable()
export class ArtistasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateArtistaDto) {
    const usuarioExiste = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuarioExiste) throw new NotFoundException("Usuario nao encontrado");

    const artistaExiste = await this.prisma.artista.findUnique({ where: { usuarioId: dto.usuarioId } });
    if (artistaExiste) throw new ConflictException("Este usuario ja possui um artista vinculado");

    return this.prisma.artista.create({
      data: { nome: dto.nome, usuarioId: dto.usuarioId, bandaId: usuarioExiste.bandaId },
      include: { usuario: { select: { id: true, nome: true, cpf: true, tipo: true } } },
    });
  }

  findAll(caller: { tipo: string; bandaId?: number | null }) {
    const where = caller.tipo === "super_admin" ? {} : { bandaId: caller.bandaId ?? null };
    return this.prisma.artista.findMany({
      where,
      include: { usuario: { select: { id: true, nome: true, tipo: true } } },
      orderBy: { nome: "asc" },
    });
  }

  async findOne(id: number) {
    const artista = await this.prisma.artista.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, nome: true, tipo: true } } },
    });
    if (!artista) throw new NotFoundException("Artista nao encontrado");
    return artista;
  }

  async update(id: number, dto: Partial<CreateArtistaDto>) {
    await this.findOne(id);
    return this.prisma.artista.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.artista.delete({ where: { id } });
  }
}
