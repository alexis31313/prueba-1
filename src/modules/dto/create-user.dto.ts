import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail({}, { message: 'Debe ingresar un email válido' })
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    example: 'Segura123!',
    minLength: 8,
    description:
      'Min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial (!@#$%^&*)',
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe contener al menos una letra mayúscula',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe contener al menos una letra minúscula',
  })
  @Matches(/[0-9]/, {
    message: 'La contraseña debe contener al menos un número',
  })
  @Matches(/[!@#$%^&*]/, {
    message:
      'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
  })
  password: string;

  @ApiProperty({ enum: Role, default: Role.CONSULTOR })
  @IsEnum(Role, { message: 'Rol no válido. Use: ADMIN, BODEGUERO o CONSULTOR' })
  rol: Role;
}
