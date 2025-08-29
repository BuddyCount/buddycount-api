import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpenseModule } from './expense/expense.module';
import { dataSourceOptions } from './config/database/data-source';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ExpenseModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
