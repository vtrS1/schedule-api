import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { cpf: dto.cpf } });
    if (exists) throw new ConflictException('CPF ja cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        cpf: dto.cpf,
        senha: senhaHash,
        tipo: dto.tipo,
        bandaId: dto.bandaId ?? null,
      },
      select: { id: true, nome: true, cpf: true, tipo: true, bandaId: true, createdAt: true },
    });

    if (dto.tipo === 'artista' || dto.tipo === 'artista_vendedor') {
      await this.prisma.artista.create({
        data: { nome: dto.nome, usuarioId: usuario.id, bandaId: dto.bandaId ?? null },
      });
    }

    return usuario;
  }

  async findAll(caller: { tipo: string; bandaId?: number | null }) {
    const where = caller.tipo === 'super_admin' ? {} : { bandaId: caller.bandaId ?? null };

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true, nome: true, cpf: true, tipo: true, bandaId: true,
        banda: { select: { id: true, nome: true } },
        createdAt: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true, nome: true, cpf: true, tipo: true, bandaId: true,
        banda: { select: { id: true, nome: true } },
        createdAt: true, artista: true,
      },
    });
    if (!usuario) throw new NotFoundException('Usuario nao encontrado');
    return usuario;
  }

  async update(id: number, dto: Partial<CreateUsuarioDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.senha) data.senha = await bcrypt.hash(dto.senha, 10);

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, cpf: true, tipo: true, bandaId: true, createdAt: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { message: 'Usuario removido com sucesso' };
  }
}
