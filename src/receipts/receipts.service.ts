import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import OpenAI from 'openai';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  private openai = new OpenAI({
    apiKey:
      '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',
  });

  async findAll() {
    return this.prisma.receipt.findMany({
      include: {
        user: true,
        category: true,
        items: true,
      },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        user: true,
        category: true,
        items: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    return receipt;
  }

  async extractTextFromImage(imageBuffer: Buffer) {
    // First, get all available categories from the database
    const availableCategories = await this.prisma.category.findMany();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Розпізнай текст із чека та поверни у JSON-форматі згідно з цією схемою:
  {
    "totalPrice": Float,
    "date": "yyyy-mm-dd",
    "image_url": "назва або посилання на зображення",
    "items": [
      {
        "name": "Назва товару",
        "price": "Ціна",
        "category": "Назва категорії"
      }
    ]
  }
  
  Доступні категорії: ${availableCategories.map((cat) => cat.name).join(', ')}
  Будь ласка, використовуй тільки категорії зі списку вище. Якщо немає відповідної категорії, залиш поле порожнім.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Response content is null');
    }

    const extractedData = JSON.parse(content);

    for (const item of extractedData.items) {
      if (item.category) {
        const matchedCategory = availableCategories.find(
          (cat) => cat.name.toLowerCase() === item.category.toLowerCase(),
        );
        item.category = matchedCategory ? matchedCategory.name : null;
      }
    }

    return extractedData;
  }
  async findByUserId(userId: number) {
    return this.prisma.receipt.findMany({
      where: { userId },
      include: {
        category: true,
        items: true,
      },
    });
  }

  async findByCategoryId(categoryId: number) {
    return this.prisma.receipt.findMany({
      where: { categoryId },
      include: {
        user: true,
        items: true,
      },
    });
  }

  async create(createReceiptDto: CreateReceiptDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createReceiptDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createReceiptDto.userId} not found`,
      );
    }

    if (createReceiptDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createReceiptDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createReceiptDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.receipt.create({
      data: {
        totalPrice: createReceiptDto.totalPrice,
        date: createReceiptDto.date,
        image_url: createReceiptDto.image_url,
        user: {
          connect: { id: createReceiptDto.userId },
        },
        ...(createReceiptDto.categoryId && {
          category: {
            connect: { id: createReceiptDto.categoryId },
          },
        }),
        items: createReceiptDto.items
          ? {
              create: createReceiptDto.items.map((item) => ({
                name: item.name,
                price: item.price,
              })),
            }
          : undefined,
      },
      include: {
        user: true,
        category: true,
        items: true,
      },
    });
  }

  async update(id: number, updateReceiptDto: UpdateReceiptDto) {
    await this.findOne(id);

    if (updateReceiptDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateReceiptDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateReceiptDto.userId} not found`,
        );
      }
    }

    if (
      updateReceiptDto.categoryId !== undefined &&
      updateReceiptDto.categoryId !== null
    ) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateReceiptDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateReceiptDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      if (updateReceiptDto.items) {
        await prisma.receiptItem.deleteMany({
          where: { receiptId: id },
        });
      }

      const updatedReceipt = await prisma.receipt.update({
        where: { id },
        data: {
          ...(updateReceiptDto.totalPrice !== undefined && {
            totalPrice: updateReceiptDto.totalPrice,
          }),
          ...(updateReceiptDto.date !== undefined && {
            date: updateReceiptDto.date,
          }),
          ...(updateReceiptDto.image_url !== undefined && {
            image_url: updateReceiptDto.image_url,
          }),
          ...(updateReceiptDto.userId && {
            user: {
              connect: { id: updateReceiptDto.userId },
            },
          }),
          ...(updateReceiptDto.categoryId === null
            ? { category: { disconnect: true } }
            : updateReceiptDto.categoryId !== undefined
              ? { category: { connect: { id: updateReceiptDto.categoryId } } }
              : {}),
          ...(updateReceiptDto.items && {
            items: {
              create: updateReceiptDto.items.map((item) => ({
                name: item.name,
                price: item.price,
              })),
            },
          }),
        },
        include: {
          user: true,
          category: true,
          items: true,
        },
      });

      return updatedReceipt;
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.receipt.delete({ where: { id } });
  }
}
