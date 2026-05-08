import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

export enum TipoUsuario {
  super_admin = 'super_admin',
  admin = 'admin',
  vendedor = 'vendedor',
  artista = 'artista',
  artista_vendedor = 'artista_vendedor',
  visualizador = 'visualizador',
}

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  })
  cpf: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @Length(6, 100, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsEnum(TipoUsuario, { message: 'Tipo de usuário inválido' })
  tipo: TipoUsuario;

  @IsOptional()
  @IsInt()
  bandaId?: number;
}
