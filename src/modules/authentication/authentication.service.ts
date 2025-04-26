import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'nestjs-prisma';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';

@Injectable()
export class AuthenticationService {
  constructor(private readonly prisma: PrismaService) {}

  generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateToken(user);

    return {
      accessToken,
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      const hash = await argon2.hash(registerDto.password);

      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hash,
        },
      });

      return user;
    } catch (error) {
      console.log(error);
    }
  }
}
