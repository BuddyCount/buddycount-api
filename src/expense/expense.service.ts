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

  private getConcernedUserIds(expenseDto: CreateExpenseDto | UpdateExpenseDto): number[] {
    const paidByIds = expenseDto.paidBy?.repartition?.map((r: any) => r.userId) || [];
    const paidForIds = expenseDto.paidFor?.repartition?.map((r: any) => r.userId) || [];
    return Array.from(new Set([...paidByIds, ...paidForIds]));
  }

  private async validateUsersInGroup(groupId: string, userIds: number[]) {
    const groupMembers = await this.groupService.getGroupMemberIds(groupId);
    const invalidUsers = userIds.filter(uid => !groupMembers.includes(uid));
    if (invalidUsers.length > 0) {
      throw new BadRequestException(`Users not in group: ${invalidUsers.join(', ')}`);
    }
  }

  private validatePaidByAmount(expenseDto: CreateExpenseDto | UpdateExpenseDto) {
    if (expenseDto.paidBy?.repartitionType === "AMOUNT") {
      const total = expenseDto.paidBy.repartition
        .map((r: any) => Number(r.values?.amount) || 0)
        .reduce((a, b) => a + b, 0);
      if (total !== expenseDto.amount) {
        throw new BadRequestException(
          `Sum of paidBy repartition amounts (${total}) does not match expense amount (${expenseDto.amount})`
        );
      }
    }
    else if (expenseDto.paidBy?.repartitionType === "PORTIONS") {
      const invalidShares = expenseDto.paidBy.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .filter((share: number) => share < 0);
      if (invalidShares.length > 0) {
        throw new BadRequestException(
          `Shares in paidBy repartition must be non-negative numbers`
        );
      }
      const totalShares = expenseDto.paidBy.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .reduce((a, b) => a + b, 0);
      if (totalShares < 1) {
        throw new BadRequestException(
          `Total shares in paidBy repartition must be greater or eaqual to one`
        );
      }
    }
  }

  private validatePaidForAmount(expenseDto: CreateExpenseDto | UpdateExpenseDto) {
    if (expenseDto.paidFor?.repartitionType === "AMOUNT") {
      const total = expenseDto.paidFor.repartition
        .map((r: any) => Number(r.values?.amount) || 0)
        .reduce((a, b) => a + b, 0);
      if (total !== expenseDto.amount) {
        throw new BadRequestException(
          `Sum of paidFor repartition amounts (${total}) does not match expense amount (${expenseDto.amount})`
        );
      }
    } else if (expenseDto.paidFor?.repartitionType === "PORTIONS") {
      const invalidShares = expenseDto.paidFor.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .filter((share: number) => share < 0);
      if (invalidShares.length > 0) {
        throw new BadRequestException(
          `Shares in paidFor repartition must be non-negative numbers`
        );
      }
      const totalShares = expenseDto.paidFor.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .reduce((a, b) => a + b, 0);
      if (totalShares < 1) {
        throw new BadRequestException(
          `Total shares in paidFor repartition must be greater or eaqual to one`
        );
      }
    }
  }

  async create(createExpenseDto: CreateExpenseDto) {
    this.validatePaidByAmount(createExpenseDto);
    this.validatePaidForAmount(createExpenseDto);
    await this.validateUsersInGroup(createExpenseDto.groupId, this.getConcernedUserIds(createExpenseDto));
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  findAll() {
    return this.expenseRepository.find();
  }

  findOne(id: number) {
    return this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    this.validatePaidByAmount(updateExpenseDto);
    this.validatePaidForAmount(updateExpenseDto);
    if (!updateExpenseDto.groupId) {
      throw new BadRequestException('groupId is required');
    }
    await this.validateUsersInGroup(updateExpenseDto.groupId, this.getConcernedUserIds(updateExpenseDto));
    return this.expenseRepository.update(id, updateExpenseDto);
  }

  remove(id: number) {
    return this.expenseRepository.delete(id);
  }
}