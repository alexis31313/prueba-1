import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../modules/entities/producto.entity';
import { CreateProductoDto } from '../../modules/dto/create-producto.dto';
import { UpdateProductoDto } from '../../modules/dto/update-producto.dto';
import { Categoria } from '../../modules/entities/categoria.entity';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly stockGateway: WebsocketGateway,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id: createProductoDto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID ${createProductoDto.categoriaId} no encontrada`,
      );
    }

    const existe = await this.productoRepository.findOne({
      where: { nombre: createProductoDto.nombre },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${createProductoDto.nombre}"`,
      );
    }

    const producto = this.productoRepository.create({
      ...createProductoDto,
      categoria,
      stockMinimo: createProductoDto.stockMinimo ?? 0,
    });
    const savedProducto = await this.productoRepository.save(producto);
    this.stockGateway.emitProductCreated(savedProducto);
    return savedProducto;
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({ where: { id } });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    if (updateProductoDto.categoriaId) {
      const categoria = await this.categoriaRepository.findOne({
        where: { id: updateProductoDto.categoriaId },
      });

      if (!categoria) {
        throw new NotFoundException(
          `Categoría con ID ${updateProductoDto.categoriaId} no encontrada`,
        );
      }

      producto.categoria = categoria;
    }

    if (updateProductoDto.nombre) {
      const existe = await this.productoRepository.findOne({
        where: { nombre: updateProductoDto.nombre },
      });

      if (existe && existe.id !== id) {
        throw new ConflictException(
          `Ya existe un producto con el nombre "${updateProductoDto.nombre}"`,
        );
      }
    }

    Object.assign(producto, updateProductoDto);

    const updatedProducto = await this.productoRepository.save(producto);
    this.stockGateway.emitProductUpdated(updatedProducto);
    return updatedProducto;
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);

    await this.productoRepository.remove(producto);
    this.stockGateway.emitProductDeleted(id);
  }
}
