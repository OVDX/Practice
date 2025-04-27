import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import OpenAI from 'openai';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async findAll() {
    return this.prisma.receipt.findMany({
      include: {
        user: true,
        receiptItems: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        user: true,
        receiptItems: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }

    return receipt;
  }

  async extractTextFromImage(imageBuffer: Buffer, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const availableCategories = await this.prisma.category.findMany();
    console.log('user:', userId);
    const imageUrl = await this.uploadImageToImgur(imageBuffer);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Розпізнай текст із чека та поверни виключно JSON без пояснень. 
              Формат:
              {
                "totalPrice": Float,
                "date": "yyyy-mm-dd",
               "merchant": "Назва магазину",
                "receiptItems": [
                  {
                    "name": "Назва товару",
                    "price": Float,
                    "category": "Назва категорії"
                  }
                ]
              }
              Доступні категорії: ${availableCategories.map((cat) => cat.name).join(', ')}
              .
              Ніяких коментарів чи тексту до або після JSON.`,
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
    const cleanedContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    if (
      !cleanedContent.trim().startsWith('{') &&
      !cleanedContent.trim().startsWith('[')
    ) {
      console.error('OpenAI did not return valid JSON:', cleanedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    try {
      const extractedData = JSON.parse(cleanedContent);
      console.log('Extracted Data:', extractedData);
      // Process extracted items
      const processedItems: {
        name: string;
        price: number;
        categoryId: number | null;
      }[] = [];

      for (const item of extractedData.receiptItems) {
        let categoryId: number | null = null;
        if (item.category) {
          const matchedCategory = availableCategories.find(
            (cat) => cat.name.toLowerCase() === item.category.toLowerCase(),
          );
          if (matchedCategory) {
            categoryId = matchedCategory.id;
          }
        }

        // Convert price to string if it's not already
        const price: number =
          typeof item.price === 'number' ? item.price.toString() : item.price;

        processedItems.push({
          name: item.name,
          price: price,
          categoryId: categoryId,
        });
      }

      const receipt = await this.prisma.receipt.create({
        data: {
          totalPrice: extractedData.totalPrice,
          date: extractedData.date,
          merchant: extractedData.merchant,
          image_url: imageUrl || 'receipt_image.jpg',
          userId: userId,
          receiptItems: {
            create: processedItems.map((item: any) => ({
              name: item.name,
              price: item.price,
              categoryId: item.categoryId || 1,
            })),
          },
        },
        include: {
          receiptItems: {
            include: {
              category: true,
            },
          },
          user: true,
        },
      });

      return receipt;
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw new Error(`Failed to process receipt: ${error.message}`);
    }
  }

  async findByUserId(userId: number) {
    return this.prisma.receipt.findMany({
      where: { userId },
      include: {
        receiptItems: {
          include: {
            category: true,
          },
        },
      },
    });
  }
  private async uploadImageToImgur(imageBuffer: Buffer): Promise<string> {
    const axios = require('axios');

    try {
      const clientId = process.env.IMGUR_CLIENT_ID;
      if (!clientId) {
        throw new Error(
          'Imgur Client ID is not defined in environment variables',
        );
      }

      // Просто base64 без префіксу
      const base64Image = imageBuffer.toString('base64');

      const response = await axios({
        method: 'post',
        url: 'https://api.imgur.com/3/image',
        headers: {
          Authorization: `Client-ID ${clientId}`,
        },
        data: {
          image: base64Image, // без префіксу "data:image/png;base64,"
          type: 'base64',
        },
      });

      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.link
      ) {
        console.log('Successfully uploaded to Imgur:', response.data.data.link);
        return response.data.data.link;
      } else {
        console.error('Unexpected Imgur API response:', response.data);
        throw new Error('Invalid response from Imgur API');
      }
    } catch (error) {
      if (error.response) {
        console.error('Imgur API error response:', {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('No response from Imgur API:', error.request);
      } else {
        console.error('Imgur API request error:', error.message);
      }

      throw new Error(`Image upload failed: ${error.message}`);
    }
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

    // First create the receipt
    const receipt = await this.prisma.receipt.create({
      data: {
        totalPrice: createReceiptDto.totalPrice,
        date: createReceiptDto.date,
        image_url: createReceiptDto.image_url,
        merchant: createReceiptDto.merchant,
        userId: createReceiptDto.userId,
      },
    });

    // Then create the receipt items separately if they exist
    if (createReceiptDto.items && createReceiptDto.items.length > 0) {
      await Promise.all(
        createReceiptDto.items.map((item) =>
          this.prisma.receiptItem.create({
            data: {
              name: item.name,
              price: item.price,
              categoryId: item.categoryId,
              receiptId: receipt.id,
            },
          }),
        ),
      );
    }

    // Return the receipt with items included
    return this.findOne(receipt.id);
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

    return this.prisma.$transaction(async (prisma) => {
      // First update the receipt
      const updatedReceipt = await prisma.receipt.update({
        where: { id },
        data: {
          ...(updateReceiptDto.totalPrice !== undefined && {
            totalPrice: updateReceiptDto.totalPrice,
          }),
          ...(updateReceiptDto.merchant !== undefined && {
            merchant: updateReceiptDto.merchant,
          }),
          ...(updateReceiptDto.date !== undefined && {
            date: updateReceiptDto.date,
          }),
          ...(updateReceiptDto.image_url !== undefined && {
            image_url: updateReceiptDto.image_url,
          }),
          ...(updateReceiptDto.userId && {
            userId: updateReceiptDto.userId,
          }),
        },
      });

      // Then handle items separately if provided
      if (updateReceiptDto.items) {
        // Delete existing items
        await prisma.receiptItem.deleteMany({
          where: { receiptId: id },
        });

        // Create new items
        for (const item of updateReceiptDto.items) {
          await prisma.receiptItem.create({
            data: {
              name: item.name,
              price: item.price,
              categoryId: item.categoryId,
              receiptId: id,
            },
          });
        }
      }

      // Return the updated receipt with items included
      return this.findOne(id);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.receipt.delete({ where: { id } });
  }
}
