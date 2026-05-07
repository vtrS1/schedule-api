import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratanteDto } from './dto/create-contratante.dto';

@Injectable()
export class ContratantesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContratanteDto) {
    if (dto.cpf) {
      const exists = await this.prisma.contratante.findUnique({ where: { cpf: dto.cpf } });
      if (exists) throw new ConflictException('CPF já cadastrado');
    }
    if (dto.cnpj) {
      const exists = await this.prisma.contratante.findUnique({ where: { cnpj: dto.cnpj } });
      if (exists) throw new ConflictException('CNPJ já cadastrado');
    }

    return this.prisma.contratante.create({ data: dto });
  }

  findAll() {
    return this.prisma.contratante.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: number) {
    const c = await this.prisma.contratante.findUnique({
      where: { id },
      include: { eventos: { select: { id: true, data: true, local: true, status: true } } },
    });
    if (!c) throw new NotFoundException('Contratante não encontrado');
    return c;
  }

  async update(id: number, dto: Partial<CreateContratanteDto>) {
    await this.findOne(id);
    return this.prisma.contratante.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.contratante.delete({ where: { id } });
  }
}
