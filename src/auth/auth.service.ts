import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';

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
    if (!user || !user.hashedPassword) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
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
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Користувача не знайдено');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.hashedPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Поточний пароль невірний');
    }
    const newHashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.usersService.update(userId, {
      hashedPassword: newHashedPassword,
    });
    return this.signIn(user);
  }
}
