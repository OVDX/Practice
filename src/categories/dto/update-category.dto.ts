import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Назва категорії', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
