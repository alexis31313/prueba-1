import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string);

    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
      };
      return true;
    } catch {
      return false;
    }
  }
}
