import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'password_not_given',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController]
})
export class AuthModule { }