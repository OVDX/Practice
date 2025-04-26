import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsUrl } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, example: '' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ type: String, example: '' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ type: String, example: '' })
  @IsString()
  @IsNotEmpty()
  hashedPassword: string;

  @ApiProperty({ type: String, example: '' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: '' })
  @IsString()
  @IsUrl()
  avatar_url: string;
}
