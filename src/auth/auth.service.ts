import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { cpf, senha } = loginDto;

    const usuario = await this.prisma.usuario.findUnique({
      where: { cpf },
    });

    if (!usuario) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const payload = {
      userId: usuario.id,
      cpf: usuario.cpf,
      tipo: usuario.tipo,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        tipo: usuario.tipo,
      },
    };
  }
}
