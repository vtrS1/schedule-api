import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCategoriaDto,
  CreateDespesaDto,
  CreatePagamentoDto,
  UpdatePagamentoStatusDto,
  UpdateNumeroNFDto,
} from "./dto/financeiro.dto";

@Injectable()
export class FinanceiroService {
  constructor(private prisma: PrismaService) {}

  // --- helpers -------------------------------------------------------------

  private async assertEventoAprovado(eventoId: number, bandaId?: number | null) {
    const evento = await this.prisma.evento.findUnique({ where: { id: eventoId } });
    if (!evento) throw new NotFoundException("Evento nao encontrado");
    if (evento.status !== "aprovado") throw new BadRequestException("Somente eventos aprovados podem ter lancamentos financeiros");
    if (bandaId && evento.bandaId !== bandaId) throw new NotFoundException("Evento nao encontrado");
    return evento;
  }

  // --- Categorias ----------------------------------------------------------

  async listarCategorias(bandaId?: number | null) {
    return this.prisma.categoriaDespesa.findMany({
      where: bandaId ? { OR: [{ bandaId }, { bandaId: null }] } : {},
      orderBy: { nome: "asc" },
    });
  }

  async criarCategoria(dto: CreateCategoriaDto, bandaId?: number | null) {
    return this.prisma.categoriaDespesa.create({
      data: { nome: dto.nome, bandaId: bandaId ?? null },
    });
  }

  async removerCategoria(id: number) {
    return this.prisma.categoriaDespesa.delete({ where: { id } });
  }

  // --- Despesas -------------------------------------------------------------

  async listarDespesas(eventoId: number, bandaId?: number | null) {
    await this.assertEventoAprovado(eventoId, bandaId);
    return this.prisma.despesa.findMany({
      where: { eventoId },
      include: { categoria: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async criarDespesa(dto: CreateDespesaDto, bandaId?: number | null) {
    await this.assertEventoAprovado(dto.eventoId, bandaId);
    return this.prisma.despesa.create({
      data: {
        eventoId: dto.eventoId,
        categoriaId: dto.categoriaId,
        descricao: dto.descricao ?? null,
        valor: dto.valor,
      },
      include: { categoria: true },
    });
  }

  async removerDespesa(id: number) {
    return this.prisma.despesa.delete({ where: { id } });
  }

  // --- Pagamentos -----------------------------------------------------------

  async listarPagamentos(eventoId: number, bandaId?: number | null) {
    await this.assertEventoAprovado(eventoId, bandaId);
    return this.prisma.pagamento.findMany({
      where: { eventoId },
      orderBy: { createdAt: "asc" },
    });
  }

  async criarPagamento(dto: CreatePagamentoDto, bandaId?: number | null) {
    await this.assertEventoAprovado(dto.eventoId, bandaId);
    return this.prisma.pagamento.create({
      data: {
        eventoId: dto.eventoId,
        tipo: dto.tipo,
        forma: dto.forma,
        percentual: dto.percentual,
        valor: dto.valor,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : null,
        observacao: dto.observacao ?? null,
      },
    });
  }

  async atualizarStatusPagamento(id: number, dto: UpdatePagamentoStatusDto) {
    return this.prisma.pagamento.update({
      where: { id },
      data: {
        status: dto.status,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : undefined,
      },
    });
  }

  async removerPagamento(id: number) {
    return this.prisma.pagamento.delete({ where: { id } });
  }

  // --- NF -------------------------------------------------------------------

  async atualizarNF(eventoId: number, dto: UpdateNumeroNFDto, bandaId?: number | null) {
    await this.assertEventoAprovado(eventoId, bandaId);
    return this.prisma.evento.update({
      where: { id: eventoId },
      data: { numeroNF: dto.numeroNF },
      select: { id: true, numeroNF: true },
    });
  }

  // --- Dashboard ------------------------------------------------------------

  async getDashboard(bandaId?: number | null) {
    const bandaFilter = bandaId ? { bandaId } : {};

    const eventos = await this.prisma.evento.findMany({
      where: { status: "aprovado", ...bandaFilter },
      include: {
        despesas: true,
        pagamentos: true,
        artista: { select: { nome: true } },
        contratante: { select: { nome: true } },
        banda: { select: { nome: true } },
      },
      orderBy: { data: "desc" },
    });

    const totalBruto = eventos.reduce((s, e) => s + e.valor, 0);
    const totalDespesas = eventos.reduce((s, e) => s + e.despesas.reduce((d, x) => d + x.valor, 0), 0);
    const totalLiquido = totalBruto - totalDespesas;
    const totalRecebido = eventos.reduce(
      (s, e) => s + e.pagamentos.filter((p) => p.status === "recebido").reduce((d, x) => d + x.valor, 0),
      0,
    );
    const totalPendente = totalLiquido - totalRecebido;

    // Agrupamento mensal (últimos 6 meses)
    const agora = new Date();
    const meses: { mes: string; bruto: number; despesas: number; recebido: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const eventosMes = eventos.filter((e) => {
        const ed = new Date(e.data);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      });
      meses.push({
        mes: label,
        bruto: eventosMes.reduce((s, e) => s + e.valor, 0),
        despesas: eventosMes.reduce((s, e) => s + e.despesas.reduce((d2, x) => d2 + x.valor, 0), 0),
        recebido: eventosMes.reduce(
          (s, e) => s + e.pagamentos.filter((p) => p.status === "recebido").reduce((d2, x) => d2 + x.valor, 0),
          0,
        ),
      });
    }

    const eventosTabela = eventos.map((e) => {
      const despTotal = e.despesas.reduce((s, x) => s + x.valor, 0);
      const recebido = e.pagamentos.filter((p) => p.status === "recebido").reduce((s, x) => s + x.valor, 0);
      return {
        id: e.id,
        data: e.data,
        cidade: e.cidade,
        estado: e.estado,
        artista: e.artista.nome,
        contratante: e.contratante?.nome ?? null,
        banda: e.banda?.nome ?? null,
        valorBruto: e.valor,
        totalDespesas: despTotal,
        valorLiquido: e.valor - despTotal,
        totalRecebido: recebido,
        saldoPendente: e.valor - despTotal - recebido,
        numeroNF: e.numeroNF,
        pagamentos: e.pagamentos,
      };
    });

    return { totalBruto, totalDespesas, totalLiquido, totalRecebido, totalPendente, meses, eventos: eventosTabela };
  }
}
