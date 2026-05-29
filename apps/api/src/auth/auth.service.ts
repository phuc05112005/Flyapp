import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(email: string, password: string, fullName: string, phone?: string) {
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, phone ? { phone } : { id: '' }] } });
    if (existing) throw new BadRequestException('Email hoặc số điện thoại đã được sử dụng.');
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        fullName,
        password: await bcrypt.hash(password, 12)
      }
    });
    return this.sign(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    return this.sign(user.id, user.email, user.role);
  }

  private sign(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwt.sign(payload, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-secret',
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m'
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh',
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'
      })
    };
  }
}
