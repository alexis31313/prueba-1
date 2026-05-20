import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementsService } from '../../modules/services/movements.service';
import { MovementsController } from '../../modules/controllers/movements.controller';
import { Movement } from '../../modules/entities/movement.entity';
import { Producto } from '../../modules/entities/producto.entity';
import { StockGateway } from '../../modules/gateways/stock.gateway';
@Module({
  imports: [TypeOrmModule.forFeature([Movement, Producto])],
  controllers: [MovementsController],
  providers: [MovementsService, StockGateway],
})
export class MovementsModule {}
