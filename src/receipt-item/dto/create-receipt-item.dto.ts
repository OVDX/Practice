import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReceiptItemDto {
  @ApiProperty({ description: 'Назва товару' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID категорії', required: false })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'Ціна товару' })
  @IsNotEmpty()
  @IsString()
  price: number;
}
