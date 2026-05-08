import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min } from "class-validator";

// --- Categoria Despesa -------------------------------------------------------

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}

// --- Despesa -----------------------------------------------------------------

export class CreateDespesaDto {
  @IsNumber()
  eventoId: number;

  @IsNumber()
  categoriaId: number;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @Min(0.01)
  valor: number;
}

// --- Pagamento ----------------------------------------------------------------

export class CreatePagamentoDto {
  @IsNumber()
  eventoId: number;

  @IsEnum(["adiantamento", "saldo", "total"])
  tipo: "adiantamento" | "saldo" | "total";

  @IsEnum(["pix", "ted", "dinheiro", "cheque"])
  forma: "pix" | "ted" | "dinheiro" | "cheque";

  @IsNumber()
  @Min(1)
  percentual: number;

  @IsNumber()
  @Min(0.01)
  valor: number;

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}

export class UpdatePagamentoStatusDto {
  @IsEnum(["pendente", "recebido"])
  status: "pendente" | "recebido";

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;
}

// --- NF -----------------------------------------------------------------------

export class UpdateNumeroNFDto {
  @IsString()
  @IsNotEmpty()
  numeroNF: string;
}
