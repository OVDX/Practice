import { Receipt } from '../../receipts/entities/receipt.entity';

export class User {
  id: number;

  email: string;

  firstName: string;

  lastName: string;

  picture: string;

  googleId: string;

  hashedPassword: string;

  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}
