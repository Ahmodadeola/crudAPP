import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async login(dto: AuthDto) {
    const { email, password } = dto;
    //   check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password with hash
    const pwMatch = await argon.verify(user.hash, password);
    if (!pwMatch) throw new ForbiddenException('Credentials incorect');

    // return login details with token
    const { hash: _, ...userData } = user;
    return userData;
  }

  async register(dto: AuthDto) {
    const { email, password } = dto;
    try {
      //   check if email exist in db
      const emailUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      // hash password
      const hash: string = await argon.hash(password);

      // save data in db
      const { hash: p, ...user } = await this.prisma.user.create({
        data: { email, hash },
      });

      // return data
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      throw Error;
    }
  }
}
