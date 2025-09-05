import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto, UserShareDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupService } from '../group/group.service';
import { BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ImageService } from '../image/image.service';
import { RepartitionType } from '../utils/types';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly imageService: ImageService,
  ) {}

  private getConcernedUserIds(
    expenseDto: CreateExpenseDto | UpdateExpenseDto,
  ): number[] {
    const paidByIds =
      expenseDto.paidBy?.repartition?.map((r: UserShareDto) => r.userId) || [];
    const paidForIds =
      expenseDto.paidFor?.repartition?.map((r: UserShareDto) => r.userId) || [];
    return Array.from(new Set([...paidByIds, ...paidForIds]));
  }

  private async validateUsersInGroup(groupId: string, userIds: number[]) {
    const groupMembers = await this.groupService.getGroupMemberIds(groupId);
    const invalidUsers = userIds.filter((uid) => !groupMembers.includes(uid));
    if (invalidUsers.length > 0) {
      throw new BadRequestException(
        `Users not in group: ${invalidUsers.join(', ')}`,
      );
    }
  }

  private validateUserShareValues(
    userShare: UserShareDto[] | undefined,
    expense: 'paidBy' | 'paidFor',
  ) {
    if (!userShare) return;

    userShare.forEach((r) => {
      const values = r.values;
      if (
        !values?.amount &&
        values?.amount !== 0 &&
        !values?.share &&
        values?.share !== 0
      ) {
        throw new BadRequestException(
          `Each user in ${expense} repartition must have either "amount" or "share" defined`,
        );
      }
    });
  }

  private vaildateAmount(
    userShare: UserShareDto[],
    expense: 'paidBy' | 'paidFor',
    amount?: number,
  ) {
    if (userShare !== undefined && userShare !== null) {
      const total = userShare
        .map((r: UserShareDto) => Number(r.values?.amount) || 0)
        .reduce((a, b) => a + b, 0);
      if (total !== amount) {
        throw new BadRequestException(
          `Sum of ${expense} repartition amounts (${total}) does not match expense amount (${amount})`,
        );
      }
    } else {
      throw new BadRequestException(`${expense} repartition is required`);
    }
  }

  private validatePortions(
    userShare: UserShareDto[],
    expense: 'paidBy' | 'paidFor',
  ) {
    if (expense === 'paidBy') {
      throw new BadRequestException(
        `Repartition type "PORTIONS" is not allowed for paidBy`,
      );
    }

    if (userShare === undefined || userShare === null) {
      throw new BadRequestException(`${expense} repartition is required`);
    }

    if (expense === 'paidFor') {
      const invalidShares = userShare
        .map((r: UserShareDto) => Number(r.values?.share) || 0)
        .filter((share: number) => share < 0);
      if (invalidShares.length > 0) {
        throw new BadRequestException(
          `Shares in ${expense} repartition must be non-negative numbers`,
        );
      }

      const totalShares = userShare
        .map((r: UserShareDto) => Number(r.values?.share) || 0)
        .reduce((a, b) => a + b, 0);
      if (totalShares < 1) {
        throw new BadRequestException(
          `Total shares in ${expense} repartition must be greater or equal to one`,
        );
      }
    }
  }

  private validatePaid(expenseDto: CreateExpenseDto | UpdateExpenseDto) {
    // Check paidBy
    this.validateUserShareValues(expenseDto.paidBy?.repartition, 'paidBy');
    if (expenseDto.paidBy?.repartitionType === RepartitionType.AMOUNT) {
      this.vaildateAmount(
        expenseDto.paidBy?.repartition,
        'paidBy',
        expenseDto.amount,
      );
    } else if (
      expenseDto.paidBy?.repartitionType === RepartitionType.PORTIONS
    ) {
      this.validatePortions(expenseDto.paidBy?.repartition, 'paidBy');
    } else {
      throw new BadRequestException(
        `Repartition type "${expenseDto.paidBy?.repartitionType}" is not allowed for paidBy`,
      );
    }

    // Check paidFor
    this.validateUserShareValues(expenseDto.paidFor?.repartition, 'paidFor');
    if (expenseDto.paidFor?.repartitionType === RepartitionType.AMOUNT) {
      this.vaildateAmount(
        expenseDto.paidFor?.repartition,
        'paidFor',
        expenseDto.amount,
      );
    } else if (
      expenseDto.paidFor?.repartitionType === RepartitionType.PORTIONS
    ) {
      this.validatePortions(expenseDto.paidFor?.repartition, 'paidFor');
    } else {
      throw new BadRequestException(
        `Invalid repartition type "${expenseDto.paidFor?.repartitionType}" for paidFor`,
      );
    }
  }

  private validateUniqueUsers(
    paidBy?: UserShareDto[],
    paidFor?: UserShareDto[],
  ) {
    for (const userShare of [paidBy, paidFor]) {
      const userIds = userShare?.map((r) => r.userId) || [];
      const uniqueUserIds = new Set(userIds);

      if (userIds.length !== uniqueUserIds.size) {
        throw new BadRequestException(
          'User ids in a repartition must be unique',
        );
      }
    }
  }

  async create(createExpenseDto: CreateExpenseDto) {
    if (!createExpenseDto.groupId) {
      throw new BadRequestException('groupId is required');
    }

    this.validateUniqueUsers(
      createExpenseDto.paidBy.repartition,
      createExpenseDto.paidFor.repartition,
    );
    await this.validateUsersInGroup(
      createExpenseDto.groupId,
      this.getConcernedUserIds(createExpenseDto),
    );
    this.validatePaid(createExpenseDto);

    // If images links are provided, make sure they are valid
    // TODO: maybe securise this, now anyone can access any link
    if (createExpenseDto.images) {
      try {
        await Promise.all(
          createExpenseDto.images.map((image) =>
            this.imageService.getImage(image),
          ),
        );
      } catch {
        throw new BadRequestException('Image not found');
      }
    }

    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  findAll(groupId: string) {
    return this.expenseRepository.find({ where: { groupId } });
  }

  findOne(id: string) {
    return this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    if (!updateExpenseDto.groupId) {
      throw new BadRequestException('groupId is required');
    }

    this.validateUniqueUsers(
      updateExpenseDto.paidBy?.repartition,
      updateExpenseDto.paidFor?.repartition,
    );
    await this.validateUsersInGroup(
      updateExpenseDto.groupId,
      this.getConcernedUserIds(updateExpenseDto),
    );
    this.validatePaid(updateExpenseDto);

    return this.expenseRepository.update(id, updateExpenseDto);
  }

  async remove(id: string) {
    const expense = await this.expenseRepository.findOne({ where: { id } });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Delete all images related to the expense
    if (expense.images) {
      for (const image of expense.images) {
        this.imageService.deleteImage(image);
      }
    }

    return this.expenseRepository.delete(id);
  }
}
