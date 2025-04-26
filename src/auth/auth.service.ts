import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    return this.signIn(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    console.log('User:', user); // Debugging line
    if (!user || !user.hashedPassword) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    console.log('Hash in DB:', user.hashedPassword); // Чи це точно хеш?
    console.log('Password from DTO:', password);
    console.log('Is Password Valid:', isPasswordValid);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.hashedPassword, 10);
    const user = await this.usersService.create({
      ...dto,
      hashedPassword: hashedPassword,
    });
    return this.signIn(user);
  }
}
