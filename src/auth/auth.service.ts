import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  async login() {
    return 'This is the login page';
  }

  async register() {
    return 'This is the signup page';
  }
}
