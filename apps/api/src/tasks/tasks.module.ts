import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule { }