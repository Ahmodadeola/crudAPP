import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from 'src/dto';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('signup')
  async signup(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }
}
