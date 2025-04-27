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
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('receipts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.receiptsService.extractTextFromImage(file.buffer, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі чеки' })
  @ApiResponse({
    status: 200,
    description: 'Список всіх чеків',
    type: [Receipt],
  })
  findAll(@CurrentUser() user): Promise<any[]> {
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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
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
  findByUserId(@CurrentUser() user): Promise<any[]> {
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
  create(@Body() createReceiptDto: CreateReceiptDto): Promise<any> {
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
  ): Promise<any> {
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
