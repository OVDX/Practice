// users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: RegisterDto) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = dto.hashedPassword;

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        picture: dto.avatar_url,
        hashedPassword,
      },
    });
  }

  async validateUser(email: string, plainPassword: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.hashedPassword) return null;

    const isMatch = await bcrypt.compare(plainPassword, user.hashedPassword);
    return isMatch ? user : null;
  }

  async findOrCreateGoogleUser(
    email: string,
    profile: {
      firstName: string;
      lastName: string;
      picture?: string;
      googleId: string;
    },
  ) {
    let user = await this.findByEmail(email);
    if (user) return user;

    return this.prisma.user.create({
      data: {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        picture: profile.picture,
        googleId: profile.googleId,
      },
    });
  }
}
