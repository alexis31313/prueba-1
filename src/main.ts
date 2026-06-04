import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './modules/app.module';
import { ThrottlerExceptionFilter } from './common/filters/throttler.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── CORS ──────────────────────────────────────────────────────
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // ── Prefijo global de la API ──────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Filtros globales para excepciones ─────────────────────────
  // Orden: específicos primero (ThrottlerExceptionFilter), genéricos después
  app.useGlobalFilters(
    new ThrottlerExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // ── Validación global con class-validator ─────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true, // convierte tipos automáticamente (string → number)
    }),
  );

  // ── Serialización: excluye @Exclude() de las entidades ────────
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Swagger ───────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Leyder Figueroa')
    .setDescription('Sistema de Gestión de Inventarios — Caso Práctico 3')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Registro, login y perfil')
    .addTag('Products', 'Gestión de productos')
    .addTag('Categories', 'Gestión de categorías')
    .addTag('Movements', 'Entradas y salidas de inventario')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 StockMaster corriendo en: http://localhost:${port}/api/v1`);
  console.log(
    `📚 Swagger docs en:          http://localhost:${port}/api/docs\n`,
  );
}
void bootstrap();
