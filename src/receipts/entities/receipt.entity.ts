import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { ReceiptItem } from 'src/receipt-item/entities/receipt-item.entity';

@Entity({ name: 'receipts' })
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  items: ReceiptItem[];

  category?: Category | null;

  @Column()
  totalPrice: number;

  @Column()
  date: string;

  @Column()
  image_url: string;
}
