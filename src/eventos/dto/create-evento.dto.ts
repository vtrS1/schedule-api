import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateEventoDto {
  @IsNotEmpty({ message: 'artistaId é obrigatório' })
  @IsNumber()
  artistaId: number;

  @IsOptional()
  @IsNumber()
  contratanteId?: number;

  @IsNotEmpty({ message: 'Data é obrigatória' })
  @IsDateString({}, { message: 'Data inválida. Use formato ISO 8601' })
  data: string;

  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @IsString()
  cidade: string;

  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  estado: string;

  @IsNotEmpty({ message: 'Local é obrigatório' })
  @IsString()
  local: string;

  @IsNotEmpty({ message: 'Valor é obrigatório' })
  @IsNumber()
  valor: number;
}
