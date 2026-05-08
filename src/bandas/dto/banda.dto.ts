import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBandaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}

export class UpdateBandaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
