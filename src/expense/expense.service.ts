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

  private vaildateAmount(expenseDto: CreateExpenseDto | UpdateExpenseDto, expense : 'paidBy' | 'paidFor') {
    if (expenseDto[expense]?.repartition) {
      const total = expenseDto[expense].repartition
        .map((r: any) => Number(r.values?.amount) || 0)
        .reduce((a, b) => a + b, 0);
      if (total !== expenseDto.amount) {
        throw new BadRequestException(
          `Sum of ${expense} repartition amounts (${total}) does not match expense amount (${expenseDto.amount})`
        );
      }
    } else {
      throw new BadRequestException(
        `${expense} repartition is required`
      );
    }
  }

  private validatePortions(expenseDto: CreateExpenseDto | UpdateExpenseDto, expense: 'paidBy' | 'paidFor') {
    if (expense === 'paidBy') {
      throw new BadRequestException(
        `Repartition type "PORTIONS" is not allowed for paidBy`
      );
    }
    if (expenseDto[expense]?.repartition && expense === "paidFor") {
      const invalidShares = expenseDto[expense]?.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .filter((share: number) => share < 0);
      if (invalidShares.length > 0) {
        throw new BadRequestException(
          `Shares in ${expense} repartition must be non-negative numbers`
        );
      }
      const totalShares = expenseDto[expense]?.repartition
        .map((r: any) => Number(r.values?.share) || 0)
        .reduce((a, b) => a + b, 0);
      if (totalShares < 1) {
        throw new BadRequestException(
          `Total shares in ${expense} repartition must be greater or equal to one`
        );
      }
    } else  {
      throw new BadRequestException(
        `${expense} repartition is required`
      );
    }
  }

  private validatePaid(expenseDto: CreateExpenseDto | UpdateExpenseDto, expense: 'paidBy' | 'paidFor') {
    if(expenseDto[expense]?.repartitionType === "AMOUNT") {
      this.vaildateAmount(expenseDto, expense);
    } else if (expenseDto[expense]?.repartitionType === "PORTIONS") {
      this.validatePortions(expenseDto, expense);
    } else {
      throw new BadRequestException(
        `Repartition type "${expenseDto[expense]?.repartitionType}" is not allowed for ${expense}`
      );
    }
  }
  

  async create(createExpenseDto: CreateExpenseDto) {
    this.validatePaid(createExpenseDto, 'paidBy');
    this.validatePaid(createExpenseDto, 'paidFor');
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
    this.validatePaid(updateExpenseDto, 'paidBy');
    this.validatePaid(updateExpenseDto, 'paidFor');
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