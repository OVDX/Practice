import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReceiptItemDto } from '../../receipt-item/dto/create-receipt-item.dto';

export class CreateReceiptDto {
  @ApiProperty({ description: 'ID користувача' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Загальна сума чеку' })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ description: 'Дата чеку' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: 'Магазин' })
  @IsNotEmpty()
  @IsString()
  merchant: string;

  @ApiProperty({ description: 'URL зображення чеку' })
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @ApiProperty({
    description: 'Список товарів у чеку',
    type: [CreateReceiptItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];
}
