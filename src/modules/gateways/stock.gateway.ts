import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Producto } from '../entities/producto.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    client.join('inventory');
  }

  handleDisconnect(client: Socket): void {
    // Connection disconnected
  }

  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket): void {
    client.join('admins');
    client.emit('joinedAdminRoom', { room: 'admins' });
  }

  sendLowStockAlert(product: Producto): void {
    if (!product || product.stockActual > (product.stockMinimo ?? 0)) {
      return;
    }

    this.server.to('admins').emit('lowStockAlert', {
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
