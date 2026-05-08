import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContratanteDto } from "./dto/create-contratante.dto";

@Injectable()
export class ContratantesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContratanteDto, caller: { tipo: string; bandaId?: number | null }) {
    if (dto.cpf) {
      const exists = await this.prisma.contratante.findUnique({ where: { cpf: dto.cpf } });
      if (exists) throw new ConflictException("CPF ja cadastrado");
    }
    if (dto.cnpj) {
      const exists = await this.prisma.contratante.findUnique({ where: { cnpj: dto.cnpj } });
      if (exists) throw new ConflictException("CNPJ ja cadastrado");
    }
    return this.prisma.contratante.create({
      data: { ...dto, bandaId: caller.bandaId ?? null },
    });
  }

  findAll(caller: { tipo: string; bandaId?: number | null }) {
    const where = caller.tipo === "super_admin" ? {} : { bandaId: caller.bandaId ?? null };
    return this.prisma.contratante.findMany({ where, orderBy: { nome: "asc" } });
  }

  async findOne(id: number) {
    const c = await this.prisma.contratante.findUnique({
      where: { id },
      include: { eventos: { select: { id: true, data: true, local: true, status: true } } },
    });
    if (!c) throw new NotFoundException("Contratante nao encontrado");
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
