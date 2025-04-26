import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReceiptItemDto {
  @ApiProperty({ description: 'Назва товару' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Ціна товару' })
  @IsNotEmpty()
  @IsString()
  price: string;
}
