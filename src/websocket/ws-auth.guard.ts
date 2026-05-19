import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../modules/strategies/jwt.strategy';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener el socket del contexto WebSocket
    const client: Socket = context.switchToWs().getClient<Socket>();

    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      throw new WsException('Token no proporcionado');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      // Inyectar el usuario autenticado en client.data para
      // que esté disponible en todos los handlers del gateway
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
      };

      return true;
    } catch (error) {
      client.disconnect();

      // Distinguir entre token expirado y token inválido
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new WsException('Token expirado');
      }

      throw new WsException('Token inválido');
    }
  }

  /**
   * Extrae el JWT desde handshake.auth.token
   * Soporta formato "Bearer <token>" y token directo
   */
  private extractToken(client: Socket): string | null {
    const raw: unknown = client.handshake?.auth?.token;

    if (!raw || typeof raw !== 'string') {
      return null;
    }

    // Soporte para "Bearer <token>" o token directo
    if (raw.startsWith('Bearer ')) {
      const token = raw.slice(7).trim();
      return token.length > 0 ? token : null;
    }

    return raw.trim() || null;
  }
}