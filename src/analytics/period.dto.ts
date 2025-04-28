import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class PeriodDto {
  @ApiPropertyOptional({
    description: 'Start date for the period (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for the period (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
