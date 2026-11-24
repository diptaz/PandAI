import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
// import { AuthGuard } from '../auth/auth.guard.js';

@Controller('users')
// @UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('preferences')
    async savePreferences(@Request() req: any, @Body() body: any) {
        // req.user didapatkan dari validasi AuthGuard JWT
        return this.usersService.savePreferences(req.user.sub, body);
    }
}