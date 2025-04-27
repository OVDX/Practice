import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

@Injectable()
export class ReceiptItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.receiptItem.findMany({
      include: {
        receipt: true,
        category: true,
      },
    });
  }
  async findByUserId(userId: number) {
    return this.prisma.receiptItem.findMany({
      where: {
        receipt: {
          userId: userId,
        },
      },
      include: {
        receipt: true,
        category: true,
      },
    });
  }
  async findOne(id: number) {
    const receiptItem = await this.prisma.receiptItem.findUnique({
      where: { id },
      include: {
        receipt: true,
        category: true,
      },
    });

    if (!receiptItem) {
      throw new NotFoundException(`Receipt item with ID ${id} not found`);
    }

    return receiptItem;
  }

  async findByReceiptId(receiptId: number) {
    return this.prisma.receiptItem.findMany({
      where: { receiptId },
      include: { category: true },
    });
  }

  async create(receiptId: number, createReceiptItemDto: CreateReceiptItemDto) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${receiptId} not found`);
    }

    // Ensure the category exists if provided
    if (createReceiptItemDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createReceiptItemDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createReceiptItemDto.categoryId} not found`,
        );
      }
    }

    // Use either unchecked create input or create input, not a mix
    return this.prisma.receiptItem.create({
      data: {
        name: createReceiptItemDto.name,
        price: createReceiptItemDto.price,
        categoryId: createReceiptItemDto.categoryId,
        receiptId: receiptId,
      },
      include: {
        receipt: true,
        category: true,
      },
    });
  }

  async update(id: number, updateReceiptItemDto: UpdateReceiptItemDto) {
    await this.findOne(id);

    // Ensure the category exists if provided
    if (updateReceiptItemDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateReceiptItemDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateReceiptItemDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.receiptItem.update({
      where: { id },
      data: updateReceiptItemDto,
      include: {
        receipt: true,
        category: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.receiptItem.delete({ where: { id } });
  }
}
