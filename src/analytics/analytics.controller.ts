import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PeriodDto } from './period.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('category-spending/')
  @ApiOperation({ summary: 'Get category spending by month for a user' })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for analytics (defaults to current year)',
  })
  async getCategorySpendingByMonth(@Req() req, @Query('year') year?: number) {
    return this.analyticsService.getCategorySpendingByMonth(req.user.id, year);
  }

  @Get('monthly-spending/')
  @ApiOperation({ summary: 'Get monthly spending totals for a user' })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for analytics (defaults to current year)',
  })
  async getMonthlySpending(@Req() req, @Query('year') year?: number) {
    return this.analyticsService.getMonthlySpending(req.user.id, year);
  }

  @Get('top-categories/')
  @ApiOperation({ summary: 'Get top spending categories for a user' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO format (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO format (yyyy-mm-dd)',
  })
  async getTopCategories(@Req() req, @Query() periodDto?: PeriodDto) {
    const period =
      periodDto?.startDate && periodDto?.endDate
        ? {
            startDate: new Date(periodDto.startDate),
            endDate: new Date(periodDto.endDate),
          }
        : undefined;

    return this.analyticsService.getTopCategories(req.user.id, period);
  }

  @Get('merchant-spending/')
  @ApiOperation({ summary: 'Get spending by merchant for a user' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO format (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO format (yyyy-mm-dd)',
  })
  async getMerchantSpending(@Req() req, @Query() periodDto?: PeriodDto) {
    const period =
      periodDto?.startDate && periodDto?.endDate
        ? {
            startDate: new Date(periodDto.startDate),
            endDate: new Date(periodDto.endDate),
          }
        : undefined;

    return this.analyticsService.getMerchantSpending(req.user.id, period);
  }

  @Get('daily-trend/')
  @ApiOperation({ summary: 'Get daily spending trend for a specified period' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in ISO format (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in ISO format (yyyy-mm-dd)',
  })
  async getDailySpendingTrend(@Req() req, @Query() periodDto: PeriodDto) {
    if (!periodDto.startDate || !periodDto.endDate) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      return this.analyticsService.getDailySpendingTrend(
        req.user.id,
        startDate,
        endDate,
      );
    }

    return this.analyticsService.getDailySpendingTrend(
      req.user.id,
      new Date(periodDto.startDate),
      new Date(periodDto.endDate),
    );
  }

  @Get('overview/')
  @ApiOperation({
    summary:
      'Get spending overview (current month, previous month, year to date)',
  })
  async getSpendingOverview(@Req() req) {
    return this.analyticsService.getSpendingOverview(req.user.id);
  }
}
