import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpenseModule } from './expense/expense.module';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: '127.0.0.1',
      // host: 'localhost',
      host: 'db',
      port: 5432,
      password: 'backend',
      username: 'backend',
      database: 'backend',
      entities: [join(__dirname, '**', '*.entity.{js,ts}')],
      synchronize: true,
      // logging: true,
    }),
    ExpenseModule,
    UserModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
