import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Categoria } from '../../modules/entities/categoria.entity';

@Entity('productos')
export class Producto {
  @ApiProperty({ example: 1, description: 'ID único del producto' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Laptop Dell', description: 'Nombre del producto' })
  @Column({ length: 100 })
  nombre!: string;

  @ApiProperty({
    example: 'Laptop de 15 pulgadas con procesador i7',
    description: 'Descripción del producto',
  })
  @Column({ length: 255, nullable: true })
  descripcion?: string;

  @ApiProperty({ example: 999.99, description: 'Precio del producto' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @ApiProperty({ example: 50, description: 'Stock actual del producto' })
  @Column({ name: 'stock_actual' })
  stockActual!: number;

  @ApiProperty({
    example: 10,
    description: 'Stock mínimo antes de generar alerta',
  })
  @Column({ name: 'stock_minimo', type: 'int', default: 0 })
  stockMinimo!: number;

  @ApiProperty({ type: () => Categoria, description: 'Categoría del producto' })
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    eager: true,
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: Categoria;
}
