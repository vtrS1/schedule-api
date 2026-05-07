import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArtistaDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'usuarioId é obrigatório' })
  usuarioId: number;
}
