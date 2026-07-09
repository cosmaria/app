import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { DomainExceptionFilter } from './app/auth/domain-exception.filter';

/**
 * Ponto de entrada do Modular Monolith COSMARIA (doc 04 §5, doc 13 §16).
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);

  // Validação de DTOs de entrada (doc 09) — rejeita campos desconhecidos.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Traduz erros de domínio para o formato de erro único da API (doc 09 §5).
  app.useGlobalFilters(new DomainExceptionFilter());

  // Fecha pool Postgres e conexão Redis no SIGTERM/SIGINT (doc 09, stateless).
  app.enableShutdownHooks();

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  Logger.log(`🚀 COSMARIA API iniciada em http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
}

void bootstrap();
