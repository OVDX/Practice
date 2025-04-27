import { Module } from '@nestjs/common';
import { ReceiptItemService } from './receipt-item.service';
import { ReceiptItemController } from './receipt-item.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  controllers: [ReceiptItemController],
  providers: [ReceiptItemService],
  exports: [ReceiptItemService],
})
export class ReceiptItemModule {}
