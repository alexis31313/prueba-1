import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos por la ruta
    const rolesRequeridos = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene @Roles(), cualquier usuario autenticado puede acceder
    if (!rolesRequeridos) return true;

    const { user } = context.switchToHttp().getRequest();

    const tienePermiso = rolesRequeridos.includes(user?.rol as Role);
    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: ${rolesRequeridos.join(', ')}`,
      );
    }
    return true;
  }
}
