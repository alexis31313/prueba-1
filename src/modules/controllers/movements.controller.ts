import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { MovementsService } from '../../modules/services/movements.service';
import { CreateMovementDto } from '../../modules/dto/create-movement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Movements')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @Roles(Role.BODEGUERO)
  @ApiOperation({
    summary: 'Registrar entrada o salida de inventario (solo BODEGUERO)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente para realizar la salida',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado — se requiere rol BODEGUERO',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  create(@Body() dto: CreateMovementDto, @Request() req) {
    return this.movementsService.create(dto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.BODEGUERO)
  @ApiOperation({ summary: 'Listar todos los movimientos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll() {
    return this.movementsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BODEGUERO)
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Movimiento encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findOne(id);
  }

  @Get('product/:productId')
  @Roles(Role.ADMIN, Role.BODEGUERO, Role.CONSULTOR)
  @ApiOperation({ summary: 'Listar movimientos por producto' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Movimientos del producto obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.movementsService.findByProduct(productId);
  }
}
