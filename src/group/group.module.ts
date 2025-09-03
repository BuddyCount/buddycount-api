import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupExpenseController } from './group-expense/group-expense.controller';
import { ExpenseModule } from 'src/expense/expense.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), forwardRef(() => ExpenseModule), ImageModule],
  controllers: [GroupController, GroupExpenseController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule { }
