import { Category } from '../../categories/entities/category.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';

export class Receipt {
  id: number;

  receiptItems: ReceiptItem[];

  category: Category | null;
  merchant: string;
  totalPrice: number;
  date: string;
  image_url: string;
}
