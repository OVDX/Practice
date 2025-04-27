// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { ReceiptsService } from '../receipts/receipts.service';
// import { CategoriesService } from '../categories/categories.service';
// import { ReceiptItemService } from 'src/receipt-item/receipt-item.service';

// @Injectable()
// export class AnalyticsService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly receiptsService: ReceiptsService,
//     private readonly receiptItemService: ReceiptItemService,
//     private readonly categoriesService: CategoriesService,
//   ) {}

//   // Підрахунок загальних витрат за певний період
//   async getTotalExpenses(startDate: string, endDate: string): Promise<number> {
//     const receipts = await this.prisma.receipt.findMany({
//       where: {
//         date: {
//           gte: new Date(startDate).toISOString(),
//           lte: new Date(endDate).toISOString(),
//         },
//       },
//     });
//     return receipts.reduce((total, receipt) => total + receipt.totalPrice, 0);
//   }

//   async getExpensesByCategory(startDate: string, endDate: string, userId: number) {
//     const categories = await this.categoriesService.findAll();

//     const expensesByCategory = await Promise.all(
//       categories.map(async (category) => {
//         const receiptItems = await this.receiptItemService.findAll();
//         const totalCategoryExpense = receiptItems
//           .filter((item) => item.categoryId === category.id)
//           .reduce((sum, item) => sum + item.price, 0);

//         return {
//           categoryName: category.name,
//           totalExpense: totalCategoryExpense,
//         };
//       }),
//     );

//     return expensesByCategory;
//   }

//   // Середня сума чека за певний період
//   async getAverageReceiptAmount(
//     startDate: string,
//     endDate: string,
//   ): Promise<number> {
//     const receipts = await this.prisma.receipt.findMany({
//       where: {
//         date: {
//           gte: new Date(startDate),
//           lte: new Date(endDate),
//         },
//       },
//     });

//     if (receipts.length === 0) {
//       return 0;
//     }

//     const totalAmount = receipts.reduce(
//       (sum, receipt) => sum + receipt.totalPrice,
//       0,
//     );
//     return totalAmount / receipts.length;
//   }

//   // Тренди по датах (витрати по місяцях)
//   async getExpensesByMonth(startDate: string, endDate: string) {
//     const receipts = await this.prisma.receipt.findMany({
//       where: {
//         date: {
//           gte: new Date(startDate),
//           lte: new Date(endDate),
//         },
//       },
//     });

//     const expensesByMonth = receipts.reduce((acc, receipt) => {
//       const month = receipt.date.getMonth() + 1; // 0 - January, 1 - February, ...
//       const year = receipt.date.getFullYear();
//       const key = `${year}-${month}`;

//       if (!acc[key]) {
//         acc[key] = 0;
//       }
//       acc[key] += receipt.totalPrice;

//       return acc;
//     }, {});

//     return expensesByMonth;
//   }

//   // Найпопулярніші категорії по витратах
//   async getTopCategoriesByExpenses(limit: number = 5) {
//     const categories = await this.categoriesService.findAll();

//     const expensesByCategory = await Promise.all(
//       categories.map(async (category) => {
//         const receiptItems = await this.receiptItemService.findAll();
//         const totalCategoryExpense = receiptItems
//           .filter((item) => item.categoryId === category.id)
//           .reduce((sum, item) => sum + item.price, 0);

//         return {
//           categoryName: category.name,
//           totalExpense: totalCategoryExpense,
//         };
//       }),
//     );

//     const sortedExpenses = expensesByCategory.sort(
//       (a, b) => b.totalExpense - a.totalExpense,
//     );
//     return sortedExpenses.slice(0, limit);
//   }
// }
