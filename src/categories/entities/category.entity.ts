import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Receipt } from '../../receipts/entities/receipt.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
