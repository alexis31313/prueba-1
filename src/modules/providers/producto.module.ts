import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from '../../modules/services/producto.service';
import { ProductoController } from '../../modules/controllers/producto.controller';
import { Producto } from '../../modules/entities/producto.entity';
import { Categoria } from '../../modules/entities/categoria.entity';
import { StockGatewayModule } from './stock-gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria]), StockGatewayModule],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService],
})
export class ProductoModule {}
