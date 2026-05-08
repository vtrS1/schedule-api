import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventoDto } from "./dto/create-evento.dto";

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventoDto, user: { userId: number; tipo: string; bandaId?: number | null }) {
    const artista = await this.prisma.artista.findUnique({ where: { id: dto.artistaId } });
    if (!artista) throw new NotFoundException("Artista nao encontrado");

    const conflito = await this.prisma.evento.findFirst({
      where: { artistaId: dto.artistaId, data: new Date(dto.data), status: { not: "recusado" } },
    });
    if (conflito) throw new ConflictException("Ja existe um evento para este artista nesta data");

    return this.prisma.evento.create({
      data: {
        artistaId: dto.artistaId,
        contratanteId: dto.contratanteId ?? null,
        bandaId: user.bandaId ?? null,
        data: new Date(dto.data),
        cidade: dto.cidade,
        estado: dto.estado,
        local: dto.local,
        valor: dto.valor,
        criadoPor: user.userId,
      },
      include: {
        artista: { select: { id: true, nome: true } },
        contratante: { select: { id: true, nome: true } },
        criador: { select: { id: true, nome: true, tipo: true } },
        banda: { select: { id: true, nome: true } },
      },
    });
  }

  async findAll(user: { userId: number; tipo: string; bandaId?: number | null }) {
    const { tipo, userId, bandaId } = user;
    const bandaFilter = tipo === "super_admin" ? {} : { bandaId: bandaId ?? null };

    if (tipo === "artista") {
      const artista = await this.prisma.artista.findUnique({ where: { usuarioId: userId } });
      if (!artista) return [];
      return this.prisma.evento.findMany({
        where: { artistaId: artista.id, ...bandaFilter },
        include: {
          artista: { select: { id: true, nome: true } },
          contratante: { select: { id: true, nome: true } },
          criador: { select: { id: true, nome: true } },
          banda: { select: { id: true, nome: true } },
        },
        orderBy: { data: "asc" },
      });
    }

    if (tipo === "artista_vendedor") {
      const artista = await this.prisma.artista.findUnique({ where: { usuarioId: userId } });
      const where = artista ? { artistaId: artista.id, ...bandaFilter } : { ...bandaFilter };
      return this.prisma.evento.findMany({
        where,
        include: {
          artista: { select: { id: true, nome: true } },
          contratante: { select: { id: true, nome: true } },
          criador: { select: { id: true, nome: true } },
          banda: { select: { id: true, nome: true } },
        },
        orderBy: { data: "asc" },
      });
    }

    if (tipo === "visualizador") {
      return this.prisma.evento.findMany({
        where: { status: "aprovado", ...bandaFilter },
        select: {
          id: true, data: true, cidade: true, estado: true, local: true, status: true,
          artista: { select: { id: true, nome: true } },
          contratante: { select: { id: true, nome: true } },
          banda: { select: { id: true, nome: true } },
        },
        orderBy: { data: "asc" },
      });
    }

    return this.prisma.evento.findMany({
      where: { ...bandaFilter },
      include: {
        artista: { select: { id: true, nome: true } },
        contratante: { select: { id: true, nome: true } },
        criador: { select: { id: true, nome: true, tipo: true } },
        banda: { select: { id: true, nome: true } },
      },
      orderBy: { data: "asc" },
    });
  }

  async findOne(id: number, user: { userId: number; tipo: string }) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: {
        artista: { select: { id: true, nome: true, usuarioId: true } },
        contratante: { select: { id: true, nome: true } },
        criador: { select: { id: true, nome: true, tipo: true } },
        banda: { select: { id: true, nome: true } },
      },
    });
    if (!evento) throw new NotFoundException("Evento nao encontrado");
    if (user.tipo === "artista" && evento.artista.usuarioId !== user.userId) {
      throw new ForbiddenException("Acesso negado");
    }
    return evento;
  }

  async aprovar(id: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException("Evento nao encontrado");
    return this.prisma.evento.update({
      where: { id },
      data: { status: "aprovado" },
      include: { artista: { select: { id: true, nome: true } } },
    });
  }

  async recusar(id: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException("Evento nao encontrado");
    return this.prisma.evento.update({
      where: { id },
      data: { status: "recusado" },
      include: { artista: { select: { id: true, nome: true } } },
    });
  }
}
