import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { ExpenseService } from 'src/expense/expense.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Group Expenses')
@Controller('group/:groupId/expense')
export class GroupExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Param('groupId') groupId: string,
  ) {
    if (createExpenseDto.groupId !== groupId) {
      throw new BadRequestException('Group id does not match');
    }

    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  findAll(@Param('groupId') groupId: string) {
    return this.expenseService.findAll(groupId);
  }
}
