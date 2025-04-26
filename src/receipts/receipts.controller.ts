import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('receipts')
@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.receiptsService.extractTextFromImage(file.buffer);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі чеки' })
  @ApiResponse({
    status: 200,
    description: 'Список всіх чеків',
    type: [Receipt],
  })
  findAll(@CurrentUser() user): Promise<Receipt[]> {
    return this.receiptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати чек за ID' })
  @ApiParam({ name: 'id', description: 'ID чеку' })
  @ApiResponse({
    status: 200,
    description: 'Чек знайдено',
    type: Receipt,
  })
  @ApiResponse({ status: 404, description: 'Чек не знайдено' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Receipt> {
    return this.receiptsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Отримати чеки користувача' })
  @ApiParam({ name: 'userId', description: 'ID користувача' })
  @ApiResponse({
    status: 200,
    description: 'Список чеків користувача',
    type: [Receipt],
  })
  findByUserId(@CurrentUser() user): Promise<Receipt[]> {
    return this.receiptsService.findByUserId(user.sub);
  }

  @Post('/manual')
  @ApiOperation({ summary: 'Створити новий чек' })
  @ApiBody({ type: CreateReceiptDto })
  @ApiResponse({
    status: 201,
    description: 'Чек створено',
    type: Receipt,
  })
  @ApiResponse({
    status: 404,
    description: 'Користувача або категорію не знайдено',
  })
  create(@Body() createReceiptDto: CreateReceiptDto): Promise<Receipt> {
    return this.receiptsService.create(createReceiptDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити чек' })
  @ApiParam({ name: 'id', description: 'ID чеку' })
  @ApiBody({ type: UpdateReceiptDto })
  @ApiResponse({
    status: 200,
    description: 'Чек оновлено',
    type: Receipt,
  })
  @ApiResponse({
    status: 404,
    description: 'Чек, користувача або категорію не знайдено',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReceiptDto: UpdateReceiptDto,
  ): Promise<Receipt> {
    return this.receiptsService.update(id, updateReceiptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити чек' })
  @ApiParam({ name: 'id', description: 'ID чеку' })
  @ApiResponse({ status: 200, description: 'Чек видалено' })
  @ApiResponse({ status: 404, description: 'Чек не знайдено' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.receiptsService.remove(id);
  }
}
