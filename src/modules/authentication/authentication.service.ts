import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'nestjs-prisma';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { getEmailTemplate } from 'src/common/helpers/email';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: MailerService,
  ) {}

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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('Email not exists');
    }

    const token = await this.generateToken(user);

    await this.emailService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      html: getEmailTemplate(token),
    });

    return {
      message: 'Email sent, please check your email',
    };
  }

  async resetPassword(userEmail: string, resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hash = await argon2.hash(resetPasswordDto.password);

    await this.prisma.user.update({
      where: { email: userEmail },
      data: {
        password: hash,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
