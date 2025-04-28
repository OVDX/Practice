import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategorySpendingByMonth(userId: number, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const results = await this.prisma.$queryRaw`
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        EXTRACT(MONTH FROM r.date::timestamp) as month,
        SUM(ri.price) as "totalSpent"
      FROM "ReceiptItem" ri
      JOIN "Receipt" r ON ri."receiptId" = r.id
      JOIN "Category" c ON ri."categoryId" = c.id
      WHERE r."userId" = ${userId}
        AND EXTRACT(YEAR FROM r.date::timestamp) = ${currentYear}
      GROUP BY c.id, c.name, EXTRACT(MONTH FROM r.date::timestamp)
      ORDER BY EXTRACT(MONTH FROM r.date::timestamp), c.name
    `;

    return results;
  }

  async getMonthlySpending(userId: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    console.log('Current Year:', currentYear);
    const results = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM r.date::timestamp) as month,
        SUM(r."totalPrice") as "totalSpent"
      FROM "Receipt" r
      WHERE r."userId" = ${userId}
        AND EXTRACT(YEAR FROM r.date::timestamp) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM r.date::timestamp)
      ORDER BY EXTRACT(MONTH FROM r.date::timestamp)
    `;

    return results;
  }

  async getTopCategories(
    userId: number,
    period?: { startDate: Date; endDate: Date },
  ) {
    let query = `
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        SUM(ri.price) as "totalSpent"
      FROM "ReceiptItem" ri
      JOIN "Receipt" r ON ri."receiptId" = r.id
      JOIN "Category" c ON ri."categoryId" = c.id
      WHERE r."userId" = ${userId}
    `;

    // Додаємо фільтр по періоду, якщо він вказаний
    if (period) {
      const startDateStr = period.startDate.toISOString();
      const endDateStr = period.endDate.toISOString();
      query += ` AND r.date::timestamp >= '${startDateStr}'::timestamp
                 AND r.date::timestamp <= '${endDateStr}'::timestamp`;
    }

    query += `
      GROUP BY c.id, c.name
      ORDER BY "totalSpent" DESC
      LIMIT 10
    `;

    const results = await this.prisma.$queryRawUnsafe(query);
    return results;
  }

  async getMerchantSpending(
    userId: number,
    period?: { startDate: Date; endDate: Date },
  ) {
    let whereClause: Prisma.ReceiptWhereInput = { userId };

    if (period) {
      whereClause.date = {
        gte: new Date(period.startDate).toISOString(),
        lte: new Date(period.endDate).toISOString(),
      };
    }

    const results = await this.prisma.receipt.groupBy({
      by: ['merchant'],
      where: whereClause,
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
    });

    return results.map((item) => ({
      merchant: item.merchant,
      totalSpent: item._sum?.totalPrice || 0,
    }));
  }

  async getDailySpendingTrend(userId: number, startDate: Date, endDate: Date) {
    // Перетворюємо дати в формат ISO для SQL запиту
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    const results = await this.prisma.$queryRaw`
      SELECT 
        DATE(r.date::timestamp) as day,
        SUM(r."totalPrice") as "totalSpent"
      FROM "Receipt" r
      WHERE r."userId" = ${userId}
        AND r.date::timestamp >= ${startDateStr}::timestamp
        AND r.date::timestamp <= ${endDateStr}::timestamp
      GROUP BY DATE(r.date::timestamp)
      ORDER BY DATE(r.date::timestamp)
    `;

    return results;
  }

  async getSpendingOverview(userId: number) {
    // Get current month, previous month, and current year
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth, 0);

    const firstDayOfPreviousMonth = new Date(currentYear, currentMonth - 2, 1);
    const lastDayOfPreviousMonth = new Date(currentYear, currentMonth - 1, 0);

    const firstDayOfYear = new Date(currentYear, 0, 1);

    // Перетворюємо дати в формат ISO для запитів Prisma
    const firstDayOfCurrentMonthStr = firstDayOfCurrentMonth.toISOString();
    const lastDayOfCurrentMonthStr = lastDayOfCurrentMonth.toISOString();
    const firstDayOfPreviousMonthStr = firstDayOfPreviousMonth.toISOString();
    const lastDayOfPreviousMonthStr = lastDayOfPreviousMonth.toISOString();
    const firstDayOfYearStr = firstDayOfYear.toISOString();
    const todayStr = today.toISOString();

    // Current month total
    const currentMonthTotal = await this.prisma.receipt.aggregate({
      where: {
        userId,
        date: {
          gte: firstDayOfCurrentMonthStr,
          lte: lastDayOfCurrentMonthStr,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Previous month total
    const previousMonthTotal = await this.prisma.receipt.aggregate({
      where: {
        userId,
        date: {
          gte: firstDayOfPreviousMonthStr,
          lte: lastDayOfPreviousMonthStr,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Year to date total
    const yearToDateTotal = await this.prisma.receipt.aggregate({
      where: {
        userId,
        date: {
          gte: firstDayOfYearStr,
          lte: todayStr,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    return {
      currentMonth: {
        totalSpent: currentMonthTotal._sum?.totalPrice || 0,
        period: {
          start: firstDayOfCurrentMonth,
          end: lastDayOfCurrentMonth,
        },
      },
      previousMonth: {
        totalSpent: previousMonthTotal._sum?.totalPrice || 0,
        period: {
          start: firstDayOfPreviousMonth,
          end: lastDayOfPreviousMonth,
        },
      },
      yearToDate: {
        totalSpent: yearToDateTotal._sum?.totalPrice || 0,
        period: {
          start: firstDayOfYear,
          end: today,
        },
      },
    };
  }
}
