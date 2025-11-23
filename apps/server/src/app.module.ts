import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserController } from './users/user.controller';
import { CategoryController } from './category/category.controller';
import { CategoryModule } from './category/category.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [AuthModule, CategoryModule, UsersModule],
	controllers: [AppController, UserController, CategoryController],
	providers: [AppService],
})
export class AppModule {}
