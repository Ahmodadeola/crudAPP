import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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

    // create login token
    const { hash: _, ...userData } = user;
    const token = await this.signToken(userData.id, userData.email);

    // return login details with token
    return { userData, token };
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
      const token = await this.signToken(user.id, user.email);

      // return data
      return { user, token };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      throw Error;
    }
  }

  signToken(userId: number, email: string): Promise<string> {
    //   construct jwt payload
    const jwtSecret = this.config.get('JWT_SECRET');
    const payload = {
      sub: userId,
      email,
    };

    // return hashed data in a promise
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: jwtSecret,
    });
  }
}
