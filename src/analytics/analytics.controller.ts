// import {
//   Controller,
//   Get,
//   Param,
//   ParseIntPipe,
//   UseGuards,
//   Request,
// } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import {
//   ApiBearerAuth,
//   ApiTags,
//   ApiOperation,
//   ApiParam,
//   ApiResponse,
// } from '@nestjs/swagger';
// import { AnalyticsService } from './analytics.service';
// // Define interfaces for raw query results

// @Controller('analytics')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
// export class ReceiptAnalyticsController {
//   constructor(private readonly analyticsService: AnalyticsService) {}

//   @Get('spending-by-category')
//   @ApiOperation({ summary: 'Get spending by category for the current user' })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns spending amounts grouped by category',
//   })
//   async getSpendingByCategory(@Request() req) {
//     const userId = req.user.id;
//     return this.analyticsService.getSpendingByCategory(userId);
//   }

//   @Get('spending-over-time')
//   @ApiOperation({ summary: 'Get spending over time for the current user' })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns spending amounts grouped by date',
//   })
//   async getSpendingOverTime(@Request() req) {
//     const userId = req.user.id;
//     return this.analyticsService.getSpendingOverTime(userId);
//   }

//   @Get('merchants-summary')
//   @ApiOperation({
//     summary: 'Get spending summary by merchant for the current user',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns spending amounts grouped by merchant',
//   })
//   async getMerchantsSummary(@Request() req) {
//     const userId = req.user.id;
//     return this.analyticsService.getMerchantsSummary(userId);
//   }

//   @Get('top-items')
//   @ApiOperation({ summary: 'Get top purchased items for the current user' })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns most frequently purchased items',
//   })
//   async getTopItems(@Request() req) {
//     const userId = req.user.id;
//     return this.analyticsService.getTopItems(userId);
//   }

//   @Get('monthly-summary/:year')
//   @ApiOperation({ summary: 'Get monthly spending summary for a specific year' })
//   @ApiParam({
//     name: 'year',
//     description: 'Year for the monthly summary',
//     example: '2024',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns monthly spending summary',
//   })
//   async getMonthlySummary(
//     @Request() req,
//     @Param('year', ParseIntPipe) year: number,
//   ) {
//     const userId = req.user.id;
//     return this.analyticsService.getMonthlySummary(userId, year);
//   }

//   @Get('category-comparison/:categoryId/:period')
//   @ApiOperation({
//     summary: 'Compare spending in one category over different time periods',
//   })
//   @ApiParam({
//     name: 'categoryId',
//     description: 'Category ID to analyze',
//     example: '1',
//   })
//   @ApiParam({
//     name: 'period',
//     description: 'Period for comparison (month, quarter, year)',
//     example: 'month',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns category spending comparison',
//   })
//   async getCategoryComparison(
//     @Request() req,
//     @Param('categoryId', ParseIntPipe) categoryId: number,
//     @Param('period') period: string,
//   ) {
//     const userId = req.user.id;
//     return this.analyticsService.getCategoryComparison(
//       userId,
//       categoryId,
//       period,
//     );
//   }

//   @Get('spending-stats')
//   @ApiOperation({
//     summary: 'Get overall spending statistics for the current user',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Returns spending stsatistics',
//   })
//   async getSpendingStats(@Request() req) {
//     const userId = req.user.id;
//     return this.analyticsService.getSpendingStats(userId);
//   }
// }
