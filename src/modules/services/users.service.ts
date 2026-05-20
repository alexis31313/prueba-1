import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/entities/user.entity';
import { CreateUserDto } from '../../modules/dto/create-user.dto';
import { UpdateUserDto } from '../../modules/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Obtener todos los usuarios activos
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true },
    });
  }

  /**
   * Busca un usuario por su ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Actualizar un usuario
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    const user = await this.findOne(id);

    // Si viene un nuevo email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Si viene una contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar el usuario
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async remove(id: number): Promise<void> {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Soft delete: solo marcar como inactivo
    await this.usersRepository.update(id, { isActive: false });
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  /**
   * Valida que un usuario exista y esté activo
   */
  async validateUserIsActive(userId: number): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }
}
