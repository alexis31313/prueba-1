import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({
    example: 'Laptop Dell',
    description: 'Nombre del producto',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre!: string;

  @ApiProperty({
    example: 'Laptop de 15 pulgadas con procesador i7',
    description: 'Descripción opcional del producto',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255, {
    message: 'La descripción no puede superar los 255 caracteres',
  })
  descripcion?: string;

  @ApiProperty({
    example: 999.99,
    description: 'Precio del producto',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con hasta 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser positivo' })
  precio!: number;

  @ApiProperty({
    example: 50,
    description: 'Stock actual del producto',
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stockActual!: number;

  @ApiProperty({
    example: 10,
    description: 'Stock mínimo para alertas',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  stockMinimo?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría del producto',
  })
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  @IsPositive({ message: 'El ID de categoría debe ser positivo' })
  categoriaId!: number;
}
