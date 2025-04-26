import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

@Injectable()
export class ReceiptItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.receiptItem.findMany({
      include: { receipt: true },
    });
  }

  async findOne(id: number) {
    const receiptItem = await this.prisma.receiptItem.findUnique({
      where: { id },
      include: { receipt: true },
    });

    if (!receiptItem) {
      throw new NotFoundException(`Receipt item with ID ${id} not found`);
    }

    return receiptItem;
  }

  async findByReceiptId(receiptId: number) {
    return this.prisma.receiptItem.findMany({
      where: { receiptId },
    });
  }

  async create(receiptId: number, createReceiptItemDto: CreateReceiptItemDto) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${receiptId} not found`);
    }

    return this.prisma.receiptItem.create({
      data: {
        ...createReceiptItemDto,
        receipt: {
          connect: { id: receiptId },
        },
      },
      include: { receipt: true },
    });
  }

  async update(id: number, updateReceiptItemDto: UpdateReceiptItemDto) {
    await this.findOne(id);

    return this.prisma.receiptItem.update({
      where: { id },
      data: updateReceiptItemDto,
      include: { receipt: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.receiptItem.delete({ where: { id } });
  }
}
