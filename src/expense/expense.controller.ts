import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiBearerAuth, ApiParam, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth('access-token')
@ApiTags('Expenses')
@UseGuards(AuthGuard('jwt'))
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // TODO: remove or edit this, no one should be able to access all expenses at once
  // @Get()
  // findAll() {
  //   return this.expenseService.findAll();
  // }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the expense',
    required: true,
  })
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the expense',
    required: true,
  })
  @ApiBody({
    type: UpdateExpenseDto,
    description: 'The data to update the expense. Can provide only the needed fields.',
    required: true,
  })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the expense',
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
