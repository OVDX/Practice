import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Назва категорії' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
