import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface RefreshJwtPayload {
  sub: number;
  email: string;
  type: 'refresh';
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Este método se llama automáticamente si el token es válido.
   * Lo que retorne aquí queda en request.user
   */
  async validate(payload: RefreshJwtPayload) {
    if (!payload.sub || payload.type !== 'refresh') {
      throw new UnauthorizedException('Token de refresh inválido');
    }
    return { id: payload.sub, email: payload.email };
  }
}
