import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ReceiptItemModule } from './receipt-item/receipt-item.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import config from '../config';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'nestjs-prisma';
// import { AnalyticsService } from './analytics/analytics.service';
// import { AnalyticsModule } from './analytics/analytics.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    PrismaModule,
    ReceiptItemModule,
    ReceiptsModule,
    CategoriesModule,
    // AnalyticsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
