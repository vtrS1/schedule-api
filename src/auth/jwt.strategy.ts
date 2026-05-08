import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'schedule_produtora_musical_secret_key_2026',
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, cpf: payload.cpf, tipo: payload.tipo, bandaId: payload.bandaId ?? null };
  }
}
