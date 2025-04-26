import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReceiptItemService } from './receipt-item.service';
import { ReceiptItem } from './entities/receipt-item.entity';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

@ApiTags('receipt-items')
@Controller('receipt-items')
export class ReceiptItemController {
  constructor(private readonly receiptItemService: ReceiptItemService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі товари з чеків' })
  @ApiResponse({
    status: 200,
    description: 'Список всіх товарів',
    type: [ReceiptItem],
  })
  findAll(): Promise<ReceiptItem[]> {
    return this.receiptItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати товар за ID' })
  @ApiParam({ name: 'id', description: 'ID товару' })
  @ApiResponse({
    status: 200,
    description: 'Товар знайдено',
    type: ReceiptItem,
  })
  @ApiResponse({ status: 404, description: 'Товар не знайдено' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ReceiptItem> {
    return this.receiptItemService.findOne(id);
  }

  @Get('receipt/:receiptId')
  @ApiOperation({ summary: 'Отримати всі товари конкретного чеку' })
  @ApiParam({ name: 'receiptId', description: 'ID чеку' })
  @ApiResponse({
    status: 200,
    description: 'Список товарів чеку',
    type: [ReceiptItem],
  })
  findByReceiptId(
    @Param('receiptId', ParseIntPipe) receiptId: number,
  ): Promise<ReceiptItem[]> {
    return this.receiptItemService.findByReceiptId(receiptId);
  }

  @Post('receipt/:receiptId')
  @ApiOperation({ summary: 'Створити новий товар для чеку' })
  @ApiParam({ name: 'receiptId', description: 'ID чеку' })
  @ApiBody({ type: CreateReceiptItemDto })
  @ApiResponse({
    status: 201,
    description: 'Товар створено',
    type: ReceiptItem,
  })
  @ApiResponse({ status: 404, description: 'Чек не знайдено' })
  create(
    @Param('receiptId', ParseIntPipe) receiptId: number,
    @Body() createReceiptItemDto: CreateReceiptItemDto,
  ): Promise<ReceiptItem> {
    return this.receiptItemService.create(receiptId, createReceiptItemDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити товар' })
  @ApiParam({ name: 'id', description: 'ID товару' })
  @ApiBody({ type: UpdateReceiptItemDto })
  @ApiResponse({
    status: 200,
    description: 'Товар оновлено',
    type: ReceiptItem,
  })
  @ApiResponse({ status: 404, description: 'Товар не знайдено' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReceiptItemDto: UpdateReceiptItemDto,
  ): Promise<ReceiptItem> {
    return this.receiptItemService.update(id, updateReceiptItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити товар' })
  @ApiParam({ name: 'id', description: 'ID товару' })
  @ApiResponse({ status: 200, description: 'Товар видалено' })
  @ApiResponse({ status: 404, description: 'Товар не знайдено' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.receiptItemService.remove(id);
  }
}
