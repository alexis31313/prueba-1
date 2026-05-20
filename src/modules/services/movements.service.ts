import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movement, MovementType } from '../../modules/entities/movement.entity';
import { CreateMovementDto } from '../../modules/dto/create-movement.dto';
import { Producto } from '../../modules/entities/producto.entity';
import { User } from '../../modules/entities/user.entity';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,

    @InjectRepository(Producto)
    private readonly productRepository: Repository<Producto>,

    private readonly stockGateway: WebsocketGateway,
  ) {}

  async create(dto: CreateMovementDto, user: User): Promise<Movement> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${dto.productId} no encontrado`,
      );
    }

    // Validar stock en salidas
    if (dto.type === MovementType.SALIDA) {
      if (product.stockActual < dto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${product.stockActual}, solicitado: ${dto.quantity}`,
        );
      }
      product.stockActual -= dto.quantity;
    } else {
      product.stockActual += dto.quantity;
    }

    // Actualizar stock del producto
    await this.productRepository.save(product);

    if (product.stockActual <= (product.stockMinimo ?? 0)) {
      this.stockGateway.sendLowStockAlert(product);
    }

    // Registrar movimiento
    const movement = this.movementRepository.create({
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason,
      product,
      user,
    });

    const saved = await this.movementRepository.save(movement);
    this.stockGateway.emitMovementCreated(saved);
    return saved;
  }

  async findAll(): Promise<Movement[]> {
    return this.movementRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findByProduct(productId: number): Promise<Movement[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    return this.movementRepository.find({
      where: { product: { id: productId } },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Movement> {
    const movement = await this.movementRepository.findOne({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }
    return movement;
  }
}
