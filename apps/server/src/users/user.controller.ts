import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
	@Get('/')
	getAllUsers() {
		return { message: 'All users' };
	}
}
