import { Controller, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
// import { AuthGuard } from '../auth/auth.guard.js';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // @UseGuards(AuthGuard)
    @Post()
    async createTask(@Req() req: any, @Body() body: any) {
        const userId = req.user?.user_id || req.user?.id;

        const errors = [];

        if (body.size !== undefined && !Number.isInteger(body.size)) {
            errors.push('Parameter size harus berupa angka (integer)');
        }

        if (body.deadline && isNaN(Date.parse(body.deadline))) {
            errors.push('Format tanggal deadline tidak sesuai');
        }

        if (errors.length > 0) {
            throw new HttpException({
                statusCode: 400,
                message: errors,
                error: 'Bad Request'
            }, HttpStatus.BAD_REQUEST);
        }

        return this.tasksService.createTask(userId, body);
    }
}