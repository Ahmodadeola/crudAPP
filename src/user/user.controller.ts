import {
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('profile')
  async getProfile(@GetUser() user: User) {
    console.log({ user });
    return user;
  }

  @Patch('/update')
  async updateProfile(@GetUser('') user: User) {
    return 'profile will update';
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'png',
          }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return { image: image.size };
  }
}
