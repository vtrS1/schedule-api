import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBandaDto, UpdateBandaDto } from './dto/banda.dto';

@Injectable()
export class BandasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBandaDto) {
    const exists = await this.prisma.banda.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Slug já em uso');

    return this.prisma.banda.create({ data: dto });
  }

  async findAll() {
    return this.prisma.banda.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: { select: { usuarios: true, artistas: true, eventos: true } },
      },
    });
  }

  async findOne(id: number) {
    const banda = await this.prisma.banda.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: { id: true, nome: true, tipo: true, createdAt: true },
        },
        _count: { select: { artistas: true, eventos: true } },
      },
    });
    if (!banda) throw new NotFoundException('Banda não encontrada');
    return banda;
  }

  async update(id: number, dto: UpdateBandaDto) {
    await this.findOne(id);
    if (dto.slug) {
      const exists = await this.prisma.banda.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (exists) throw new ConflictException('Slug já em uso');
    }
    return this.prisma.banda.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.banda.delete({ where: { id } });
  }
}
