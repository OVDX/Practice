import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateReceiptItemDto {
  @ApiProperty({ description: 'Назва товару', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'Ціна товару', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  price?: string;
}
