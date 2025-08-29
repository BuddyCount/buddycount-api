import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupService } from '../group/group.service';
import { BadRequestException, Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class ExpenseService {

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
  ) { }

  // TODO : issue with udpateExpenseDto -> does not have paidBy and paidFor
  // so we cannot get concerned user ids from it
  private getConcernedUserIds(expenseDto: CreateExpenseDto /*| UpdateExpenseDto*/): string[] {
    const paidByIds = expenseDto.paidBy?.repartition?.map((r: any) => String(r.userId)) || [];
    const paidForIds = expenseDto.paidFor?.repartition?.map((r: any) => String(r.userId)) || [];
    return Array.from(new Set([...paidByIds, ...paidForIds]));
  }

  private async validateUsersInGroup(groupId: string, userIds: string[]) {
    const groupMembers = await this.groupService.getGroupMemberIds(groupId);
    const invalidUsers = userIds.filter(uid => !groupMembers.includes(uid));
    if (invalidUsers.length > 0) {
      throw new BadRequestException(`Users not in group: ${invalidUsers.join(', ')}`);
    }
  }

  // TODO : need co add the groupId to the createExpenseDto
  async create(createExpenseDto: CreateExpenseDto) {
    await this.validateUsersInGroup(createExpenseDto.groupId, this.getConcernedUserIds(createExpenseDto));
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  findAll() {
    return this.expenseRepository.find();
  }

  findOne(id: string) {
    return this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    //await this.validateUsersInGroup(updateExpenseDto.groupId, this.getConcernedUserIds(updateExpenseDto));
    return this.expenseRepository.update(id, updateExpenseDto);
  }

  remove(id: string) {
    return this.expenseRepository.delete(id);
  }
}