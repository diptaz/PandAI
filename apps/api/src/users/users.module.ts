import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule { }