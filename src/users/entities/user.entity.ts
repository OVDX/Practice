import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  hashedPassword: string;
  @Column({ type: 'text', nullable: true })
  avatar_url: string;
}
