import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsAuthGuard } from './ws-auth.guard';
import { ConnectedUsersStore } from './connected-users.store';
import { Producto } from '../modules/entities/producto.entity';
import { Movement } from '../modules/entities/movement.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
@Injectable()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly connectedUsersStore: ConnectedUsersStore,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);

      const user = {
        id: payload.sub,
        email: payload.email,
        nombre: payload.email,
        rol: payload.rol,
      };

      this.connectedUsersStore.add(client.id, user);

      await client.join('inventory');

      if (user.rol === 'ADMIN') {
        await client.join('admins');
      }

      this.server
        .to('admins')
        .emit('users:online', this.connectedUsersStore.getAll());
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.connectedUsersStore.remove(client.id);
    this.server
      .to('admins')
      .emit('users:online', this.connectedUsersStore.getAll());
  }

  @SubscribeMessage('joinAdminRoom')
  async handleJoinAdminRoom(@ConnectedSocket() client: Socket): Promise<void> {
    await client.join('admins');
    client.emit('joinedAdminRoom', { room: 'admins' });
  }

  @SubscribeMessage('product:watch')
  async handleProductWatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() productId: number,
  ): Promise<void> {
    await client.join(`product:${productId}`);
  }

  @SubscribeMessage('product:unwatch')
  async handleProductUnwatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() productId: number,
  ): Promise<void> {
    await client.leave(`product:${productId}`);
  }

  emitMovementCreated(movement: Movement): void {
    this.server.to('inventory').emit('movement:created', movement);
  }

  sendLowStockAlert(product: Producto): void {
    if (!product || product.stockActual > (product.stockMinimo ?? 0)) {
      return;
    }

    this.server.to('admins').emit('stock:low', {
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      stockActual: product.stockActual,
      stockMinimo: product.stockMinimo,
      categoria: product.categoria?.nombre,
      mensaje: `Stock bajo para ${product.nombre}`,
    });
  }

  emitProductCreated(producto: Producto): void {
    this.server.to('inventory').emit('product:created', producto);
  }

  emitProductUpdated(producto: Producto): void {
    this.server.to(`product:${producto.id}`).emit('product:updated', producto);
  }

  emitProductDeleted(id: number): void {
    this.server.to('inventory').emit('product:deleted', { id });
  }
}
