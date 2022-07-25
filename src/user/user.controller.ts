import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard())
  @Get('profile')
  async getProfile() {
    return this.userService.userProfile();
  }
}
