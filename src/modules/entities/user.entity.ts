import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Exclude } from 'class-transformer';
import { Movement } from '../../modules/entities/movement.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  nombre!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: Role, default: Role.CONSULTOR })
  rol!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @Exclude()
  refreshToken!: string | null;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @OneToMany(() => Movement, (m) => m.user)
  movimientos!: Movement[];
}
