import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos' })
  cpf: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @Length(6, 100, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
