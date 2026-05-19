import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WsAuthGuard } from './ws-auth.guard';
import { AuthModule } from '../modules/providers/auth.module';

@Module({
  imports: [
    // AuthModule exporta JwtModule y PassportModule
    // → nos da JwtService para verificar tokens en el guard
    AuthModule,
  ],
  providers: [WebsocketGateway, WsAuthGuard],
  exports: [WebsocketGateway], // Exportar permite inyectarlo en otros módulos
})
export class WebsocketModule {}