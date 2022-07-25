import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async userProfile() {
    return 'the user profile';
  }
}
