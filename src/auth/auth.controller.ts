import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  Body,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Авторизація через Google' })
  async googleAuth() {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Користувач зареєстрований, повертає токен доступу',
  })
  @ApiResponse({ status: 409, description: 'Користувач вже існує' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @ApiResponse({ status: 400, description: 'Поточний пароль невірний' })
  @ApiResponse({ status: 401, description: 'Користувача не знайдено' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }
  @Post('login')
  @ApiOperation({ summary: 'Авторизація користувача' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успішна авторизація, повертає токен доступу',
  })
  @ApiResponse({ status: 401, description: 'Невірні облікові дані' })
  async login(@Body() loginDto: LoginDto) {
    console.log('Login DTO:', loginDto);
    return this.authService.login(loginDto);
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Callback URL для Google авторизації' })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const tokenData = await this.authService.signIn(req.user);
    console.log('Token Data:', tokenData);
    res.cookie('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(HttpStatus.OK).json({
      message: 'Authenticated',
      ...tokenData,
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}
