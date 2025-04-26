import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReceiptItemDto } from '../../receipt-item/dto/create-receipt-item.dto';

export class UpdateReceiptDto {
  @ApiProperty({ description: 'ID користувача', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'ID категорії', required: false })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ description: 'Загальна сума чеку', required: false })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({ description: 'Дата чеку', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ description: 'URL зображення чеку', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    description: 'Список товарів у чеку',
    type: [CreateReceiptItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items?: CreateReceiptItemDto[];
}
