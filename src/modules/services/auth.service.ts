import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../../modules/entities/user.entity';
import { CreateUserDto } from '../../modules/dto/create-user.dto';
import { LoginDto } from '../../modules/dto/login.dto';
import { JwtPayload } from '../../modules/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ─── Registro ────────────────────────────────────────────────────────────────

  async register(dto: CreateUserDto) {
    // Verificar si el email ya existe
    const existe = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Crear y guardar usuario
    const usuario = this.usersRepository.create({
      ...dto,
      password: passwordHash,
    });
    await this.usersRepository.save(usuario);

    // Retornar sin la contraseña
    const { password: _password, ...resultado } = usuario;
    return resultado;
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Buscar usuario por email
    const usuario = await this.usersRepository.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generar access token (8 horas)
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    const access_token = this.jwtService.sign(payload);

    // Generar refresh token (7 días)
    const refreshPayload = {
      sub: usuario.id,
      email: usuario.email,
      type: 'refresh',
    };
    const refresh_token = this.jwtService.sign(refreshPayload, {
      expiresIn: 7 * 24 * 60 * 60, // 7 días
    });

    // Guardar refresh token en BD
    await this.usersRepository.update(usuario.id, {
      refreshToken: refresh_token,
    });

    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  // ─── Perfil ──────────────────────────────────────────────────────────────────

  async getProfile(userId: number) {
    const usuario = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!usuario) throw new UnauthorizedException();
    const { password: _password, ...perfil } = usuario;
    return perfil;
  }

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string) {
    try {
      // Validar que el token JWT sea válido
      const decoded = this.jwtService.verify(refreshToken);

      // Buscar usuario y validar que el refresh token coincida
      const usuario = await this.usersRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!usuario || usuario.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Generar nuevo access token
      const payload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      };
    } catch (_error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(userId: number) {
    // Limpiar el refresh token del usuario en la BD
    await this.usersRepository.update(userId, { refreshToken: null });

    return {
      message: 'Sesión cerrada correctamente',
    };
  }
}
