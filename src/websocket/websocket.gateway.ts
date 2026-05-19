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
   * Si no trae token se rechaza la conexión de inmediato.
   * Si trae token válido, se une automáticamente al room "inventory".
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

    // Al conectarse, el cliente se une automáticamente al room "inventory"
    client.join('inventory');
    this.logger.log(
      `Cliente conectado y unido a room "inventory": ${client.id}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Socket.io elimina al cliente de todos sus rooms automáticamente al desconectarse,
    // por lo que no recibirá más eventos hasta reconectarse y volver a unirse.
  }

  /**
   * Evento de ping protegido — verifica que el guard funciona.
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
   * Utilidad para emitir un evento a TODOS los clientes conectados.
   * (Se mantiene por compatibilidad con usos previos.)
   */
  emitToAll(event: string, data: unknown): void {
    this.server.emit(event, data);
  }

  /**
   * Emite un evento únicamente a los clientes que están en el room indicado.
   * MovementsService usa este método para notificar a los clientes en "inventory".
   */
  emitToRoom(room: string, event: string, data: unknown): void {
    this.server.to(room).emit(event, data);
    this.logger.log(`Evento "${event}" emitido al room "${room}"`);
  }
}
