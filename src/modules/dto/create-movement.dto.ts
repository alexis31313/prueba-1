import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../entities/movement.entity';

export class CreateMovementDto {
  @ApiProperty({ enum: MovementType, example: MovementType.ENTRADA })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiPropertyOptional({ example: 'Compra a proveedor XYZ' })
  @IsOptional()
  @IsString()
  reason?: string;
}
