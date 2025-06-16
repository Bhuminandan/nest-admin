import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { User } from './core/entities/user.entity';
import { seedSuperAdmin } from './infrastructure/database/seeders/superadmin.seeder';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  console.log(JSON.stringify(document, null, 2));

  SwaggerModule.setup('api-docs', app, document);

  const userRepo = app.get(DataSource).getRepository(User);
  await seedSuperAdmin(userRepo);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();
