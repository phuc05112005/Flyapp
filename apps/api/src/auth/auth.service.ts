import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

const demoUsers: Record<string, { password: string; role: Role; fullName: string }> = {
  'admin@vietfly.vn': { password: 'Admin@123456', role: Role.ADMIN, fullName: 'Quản trị VietFly' },
  'manager@vietfly.vn': { password: 'Manager@123456', role: Role.MANAGER, fullName: 'Quản lý đại lý' },
  'staff@vietfly.vn': { password: 'Staff@123456', role: Role.STAFF, fullName: 'Nhân viên bán vé' },
  'customer@test.vn': { password: 'Customer@123456', role: Role.CUSTOMER, fullName: 'Khách hàng thử nghiệm' }
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(email: string, password: string, fullName: string, phone?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          phone ? { phone } : { id: '' }
        ]
      }
    });
    if (existing) throw new BadRequestException('Email hoặc số điện thoại đã được sử dụng.');

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        phone,
        fullName,
        password: await bcrypt.hash(password, 12)
      }
    });
    return this.sign(user.id, user.email, user.role, user.fullName, user.phone);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } })
      ?? await this.ensureDemoUser(normalizedEmail, password);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa.');
    user = await this.normalizeDemoProfile(user);

    return this.sign(user.id, user.email, user.role, user.fullName, user.phone);
  }

  private sign(userId: string, email: string, role: string, fullName: string, phone?: string | null) {
    const payload = { sub: userId, email, role };
    return {
      user: {
        id: userId,
        email,
        fullName,
        phone,
        role
      },
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

  private async ensureDemoUser(email: string, password: string) {
    if (this.config.get<string>('NODE_ENV') === 'production') return null;

    const demo = demoUsers[email];
    if (!demo || demo.password !== password) return null;

    return this.prisma.user.create({
      data: {
        email,
        fullName: demo.fullName,
        role: demo.role,
        isVerified: true,
        password: await bcrypt.hash(demo.password, 12)
      }
    });
  }

  private async normalizeDemoProfile(user: User) {
    const demo = demoUsers[user.email];
    if (!demo) return user;
    if (user.fullName === demo.fullName && user.role === demo.role && user.isActive) return user;

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: demo.fullName,
        role: demo.role,
        isActive: true,
        isVerified: true
      }
    });
  }
}
