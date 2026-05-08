import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  // helper: monta include padrão com resumo financeiro para eventos aprovados
  private get includeBase() {
    return {
      artista: { select: { id: true, nome: true } },
      contratante: { select: { id: true, nome: true } },
      criador: { select: { id: true, nome: true, tipo: true } },
      banda: { select: { id: true, nome: true } },
      pagamentos: { select: { valor: true, status: true } },
      despesas: { select: { valor: true } },
    };
  }

  private mapFinanceiro(eventos: any[]) {
    return eventos.map((ev) => {
      if (ev.status !== 'aprovado') return ev;
      const totalDespesas =
        ev.despesas?.reduce((s: number, d: any) => s + d.valor, 0) ?? 0;
      const totalRecebido =
        ev.pagamentos
          ?.filter((p: any) => p.status === 'recebido')
          .reduce((s: number, p: any) => s + p.valor, 0) ?? 0;
      const saldoPendente = ev.valor - totalDespesas - totalRecebido;
      return {
        ...ev,
        _financeiro: {
          totalDespesas,
          totalRecebido,
          saldoPendente,
          status:
            saldoPendente <= 0
              ? 'quitado'
              : totalRecebido > 0
                ? 'parcial'
                : 'pendente',
        },
      };
    });
  }

  async create(
    dto: CreateEventoDto,
    user: { userId: number; tipo: string; bandaId?: number | null },
  ) {
    const artista = await this.prisma.artista.findUnique({
      where: { id: dto.artistaId },
    });
    if (!artista) throw new NotFoundException('Artista nao encontrado');

    const conflito = await this.prisma.evento.findFirst({
      where: {
        artistaId: dto.artistaId,
        data: new Date(dto.data),
        status: { not: 'recusado' },
      },
    });
    if (conflito)
      throw new ConflictException(
        'Ja existe um evento para este artista nesta data',
      );

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

  async findAll(user: {
    userId: number;
    tipo: string;
    bandaId?: number | null;
  }) {
    const { tipo, userId, bandaId } = user;
    const bandaFilter =
      tipo === 'super_admin' ? {} : { bandaId: bandaId ?? null };

    if (tipo === 'artista') {
      const artista = await this.prisma.artista.findUnique({
        where: { usuarioId: userId },
      });
      if (!artista) return [];
      const lista = await this.prisma.evento.findMany({
        where: { artistaId: artista.id, ...bandaFilter },
        include: this.includeBase,
        orderBy: { data: 'asc' },
      });
      return this.mapFinanceiro(lista);
    }

    if (tipo === 'artista_vendedor') {
      const artista = await this.prisma.artista.findUnique({
        where: { usuarioId: userId },
      });
      const where = artista
        ? { artistaId: artista.id, ...bandaFilter }
        : { ...bandaFilter };
      const lista = await this.prisma.evento.findMany({
        where,
        include: this.includeBase,
        orderBy: { data: 'asc' },
      });
      return this.mapFinanceiro(lista);
    }

    if (tipo === 'visualizador') {
      return this.prisma.evento.findMany({
        where: { status: 'aprovado', ...bandaFilter },
        select: {
          id: true,
          data: true,
          cidade: true,
          estado: true,
          local: true,
          status: true,
          artista: { select: { id: true, nome: true } },
          contratante: { select: { id: true, nome: true } },
          banda: { select: { id: true, nome: true } },
        },
        orderBy: { data: 'asc' },
      });
    }

    const lista = await this.prisma.evento.findMany({
      where: { ...bandaFilter },
      include: this.includeBase,
      orderBy: { data: 'asc' },
    });
    return this.mapFinanceiro(lista);
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
    if (!evento) throw new NotFoundException('Evento nao encontrado');
    if (user.tipo === 'artista' && evento.artista.usuarioId !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }
    return evento;
  }

  async aprovar(id: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento nao encontrado');
    return this.prisma.evento.update({
      where: { id },
      data: { status: 'aprovado' },
      include: { artista: { select: { id: true, nome: true } } },
    });
  }

  async recusar(id: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento nao encontrado');
    return this.prisma.evento.update({
      where: { id },
      data: { status: 'recusado' },
      include: { artista: { select: { id: true, nome: true } } },
    });
  }
}
