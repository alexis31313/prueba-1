import { Injectable } from '@nestjs/common';

export interface ConnectedUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

@Injectable()
export class ConnectedUsersStore {
  private readonly connectedUsers = new Map<string, ConnectedUser>();

  add(socketId: string, user: ConnectedUser): void {
    this.connectedUsers.set(socketId, user);
  }

  remove(socketId: string): void {
    this.connectedUsers.delete(socketId);
  }

  get(socketId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getAll(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  get count(): number {
    return this.connectedUsers.size;
  }
}
