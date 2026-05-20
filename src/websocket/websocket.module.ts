import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { ConnectedUsersStore } from './connected-users.store';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [WebsocketGateway, ConnectedUsersStore, WsAuthGuard],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
