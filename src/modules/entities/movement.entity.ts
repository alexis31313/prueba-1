import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Producto } from '../../modules/entities/producto.entity';
import { User } from '../../modules/entities/user.entity';

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

@Entity('movements')
export class Movement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: MovementType })
  type!: MovementType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  date!: Date;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product!: Producto;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
