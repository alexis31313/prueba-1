import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro global de excepciones HTTP
 * Captura tanto HttpException como excepciones inesperadas (500)
 * Retorna siempre un formato estándar
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // Si es una excepción HTTP estándar
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Manejo del response de validación (ValidationPipe)
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        'error' in exceptionResponse
      ) {
        message = exceptionResponse.message || 'Error';
        error = exceptionResponse.error || exception.name;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Excepciones genéricas (errores no controlados)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Error interno del servidor';
      error = exception.name || 'Internal Server Error';

      // Registrar el stack trace de errores 500 en consola
      this.logger.error(
        `Error 500 en ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      // Excepciones desconocidas
      message = 'Error desconocido';
      error = 'Unknown Error';
      this.logger.error(
        `Error desconocido en ${request.method} ${request.url}`,
        exception,
      );
    }

    // Respuesta estándar
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
