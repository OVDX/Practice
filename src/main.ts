import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Receipts API')
    .setDescription('API для управління чеками та їх категоріями')
    .setVersion('1.0')
    .addTag('receipts')
    .addTag('categories')
    .addTag('analytics')
    .addTag('receipt-items')
    .addBearerAuth()
    .addTag('users')
    .addTag('auth')
    .addSecurity('google-oauth', {
      type: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl: 'http://localhost:3000/auth/google', // заміни, якщо інший порт або домен
          scopes: {},
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      initOAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        usePkceWithAuthorizationCodeGrant: false,
      },
      authAction: {
        bearer: {
          name: 'bearer',
          schema: {
            type: 'http',
            in: 'header',
            name: 'Authorization',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'Bearer <token>',
        },
      },
    },
  });
  const port = process.env.PORT || 3000;
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
