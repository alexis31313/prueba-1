import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';

// Tipo del usuario inyectado en client.data.user por el guard
interface AuthenticatedUser {
  id: number;
  email: string;
  rol: string;
}

// Tipo auxiliar para sockets con usuario autenticado garantizado
interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

@WebSocketGateway({
  cors: {
    // Ajusta el origin según tu entorno (env variable recomendada en producción)
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  /**
   * Se ejecuta cuando un cliente intenta conectarse.
   * La autenticación real ocurre en el guard a nivel de mensaje,
   * pero podemos hacer una verificación previa aquí para rechazar
   * conexiones sin token antes de que envíen cualquier evento.
   */
  handleConnection(client: Socket): void {
    const hasToken = !!client.handshake?.auth?.token;

    if (!hasToken) {
      this.logger.warn(
        `Conexión rechazada — sin token. Socket ID: ${client.id}`,
      );
      client.disconnect();
      return;
    }

    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Evento de ping protegido — verifica que el guard funciona.
   * El guard valida el token y asigna client.data.user.
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): void {
    const { user } = client.data;
    this.logger.log(`Ping de usuario ${user.email} (id: ${user.id})`);

    client.emit('pong', {
      message: 'pong',
      user: { id: user.id, email: user.email, rol: user.rol },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Ejemplo de evento con payload tipado.
   * Úsalo como base para tus eventos de negocio (stock, movimientos, etc.)
   */
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { content: string },
  ): void {
    const { user } = client.data;

    this.logger.log(
      `Mensaje de ${user.email}: ${payload?.content ?? '(vacío)'}`,
    );

    // Broadcast a todos menos al remitente
    client.broadcast.emit('message', {
      from: { id: user.id, email: user.email },
      content: payload?.content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Utilidad para emitir eventos desde servicios externos.
   * Inyecta el gateway en tu servicio y llama este método.
   */
  emitToAll(event: string, data: unknown): void {
    this.server.emit(event, data);
  }
}