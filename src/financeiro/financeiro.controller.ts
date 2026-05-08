import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FinanceiroService } from "./financeiro.service";
import {
  CreateCategoriaDto,
  CreateDespesaDto,
  CreatePagamentoDto,
  UpdatePagamentoStatusDto,
  UpdateNumeroNFDto,
} from "./dto/financeiro.dto";

@UseGuards(JwtAuthGuard)
@Controller("financeiro")
export class FinanceiroController {
  constructor(private svc: FinanceiroService) {}

  private caller(req: any) {
    return { tipo: req.user.tipo, bandaId: req.user.bandaId ?? null };
  }

  // --- Dashboard -------------------------------------------------------------

  @Get("dashboard")
  dashboard(@Request() req: any) {
    const c = this.caller(req);
    return this.svc.getDashboard(c.tipo === "super_admin" ? null : c.bandaId);
  }

  // --- Categorias ------------------------------------------------------------

  @Get("categorias")
  listarCategorias(@Request() req: any) {
    const c = this.caller(req);
    return this.svc.listarCategorias(c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Post("categorias")
  criarCategoria(@Body() dto: CreateCategoriaDto, @Request() req: any) {
    const c = this.caller(req);
    return this.svc.criarCategoria(dto, c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Delete("categorias/:id")
  removerCategoria(@Param("id", ParseIntPipe) id: number) {
    return this.svc.removerCategoria(id);
  }

  // --- Despesas --------------------------------------------------------------

  @Get("eventos/:eventoId/despesas")
  listarDespesas(@Param("eventoId", ParseIntPipe) eventoId: number, @Request() req: any) {
    const c = this.caller(req);
    return this.svc.listarDespesas(eventoId, c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Post("despesas")
  criarDespesa(@Body() dto: CreateDespesaDto, @Request() req: any) {
    const c = this.caller(req);
    return this.svc.criarDespesa(dto, c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Delete("despesas/:id")
  removerDespesa(@Param("id", ParseIntPipe) id: number) {
    return this.svc.removerDespesa(id);
  }

  // --- Pagamentos ------------------------------------------------------------

  @Get("eventos/:eventoId/pagamentos")
  listarPagamentos(@Param("eventoId", ParseIntPipe) eventoId: number, @Request() req: any) {
    const c = this.caller(req);
    return this.svc.listarPagamentos(eventoId, c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Post("pagamentos")
  criarPagamento(@Body() dto: CreatePagamentoDto, @Request() req: any) {
    const c = this.caller(req);
    return this.svc.criarPagamento(dto, c.tipo === "super_admin" ? null : c.bandaId);
  }

  @Patch("pagamentos/:id/status")
  atualizarStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePagamentoStatusDto) {
    return this.svc.atualizarStatusPagamento(id, dto);
  }

  @Delete("pagamentos/:id")
  removerPagamento(@Param("id", ParseIntPipe) id: number) {
    return this.svc.removerPagamento(id);
  }

  // --- NF --------------------------------------------------------------------

  @Patch("eventos/:eventoId/nf")
  atualizarNF(
    @Param("eventoId", ParseIntPipe) eventoId: number,
    @Body() dto: UpdateNumeroNFDto,
    @Request() req: any,
  ) {
    const c = this.caller(req);
    return this.svc.atualizarNF(eventoId, dto, c.tipo === "super_admin" ? null : c.bandaId);
  }
}
