import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateGroupDto, UserIndexDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MoreThan, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseService } from 'src/expense/expense.service';
import { ImageService } from 'src/image/image.service';
import { differenceInCalendarDays } from 'date-fns';
import { getAugumentedDataset } from "src/types/holtwinters";

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(forwardRef(() => ExpenseService))
    private readonly expenseService: ExpenseService,
    private readonly imageService: ImageService,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    // Make sure user ids are unique
    this.validateUserIndexDto(createGroupDto.users);

    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  findOne(id: string, withExpenses: boolean) {
    const relations = withExpenses ? ['expenses'] : [];

    return this.groupRepository.findOne({ where: { id }, relations });
  }

  async getGroupMemberIds(id: string): Promise<number[]> {
    const group = await this.groupRepository.findOne({
      where: { id: id },
    });
    if (!group || !group.users) {
      return [];
    }
    return group.users.map((user: any) => user.id);
  }

  update(id: string, updateGroupDto: UpdateGroupDto) {
    // Make sure user ids are unique
    this.validateUserIndexDto(updateGroupDto.users);

    return this.groupRepository.update(id, updateGroupDto);
  }

  async remove(id: string) {
    const expenses = await this.expenseService.findAll(id);

    // Delete all images related to the expenses (if any)
    for (const expense of expenses) {
      if (!expense.images) {
        continue;
      }

      for (const image of expense.images) {
        this.imageService.deleteImage(image);
      }
    }

    return this.groupRepository.delete(id);
  }

  join(linkToken: string) {
    // TODO: check auth
    return this.groupRepository.findOne({
      where: { linkToken },
      select: ['id'],
    });
  }

  async predictGroupExpenses(groupId: string, startDate: Date) {
    const expenses = await this.parseGroupExpenses(groupId, startDate);
    console.log(expenses);

    const predictionLength = 4;

    const predictedExpenses = getAugumentedDataset(expenses, predictionLength);
    console.log(predictedExpenses);

    return predictedExpenses;
  }

  private validateUserIndexDto(userIndexDto?: UserIndexDto[]) {
    const indexes = userIndexDto?.map((userIndexDto) => userIndexDto.id) || [];
    const uniqueIndexes = new Set(indexes);

    if (indexes.length !== uniqueIndexes.size) {
      throw new BadRequestException('User ids in a group must be unique');
    }
  }

  private async parseGroupExpenses(groupId: string, startDate: Date) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, expenses: { date: MoreThan(startDate) } },
      relations: ['expenses'],
    });

    if (!group) {
      throw new BadRequestException('Group not found');
    }

    const expensesWithDates = group.expenses.map((expense) => ({
      amount: expense.amount,
      date: expense.date,
    }));

    // Create array of expenses with 0 for each day
    let expenses = new Array<number>(differenceInCalendarDays(new Date(), startDate)).fill(0);

    // Populate array with expenses
    for (let i = 0; i < expensesWithDates.length; i++) {
      const index = differenceInCalendarDays(expensesWithDates[i].date, startDate);
      expenses[index] += expensesWithDates[i].amount;  // Cumulate expenses of the same day
    }

    // Keep only from first non-zero expense to the end + add a small amount to the null expenses
    let firstNonZeroIndex = -1;
    for (let i = 0; i < expenses.length; i++) {
      if (firstNonZeroIndex === -1 && expenses[i] > 0) {
        firstNonZeroIndex = i;
      }

      if (firstNonZeroIndex !== -1 && expenses[i] === 0) {
        expenses[i] = .01;
        continue;
      }
    }

    // If no non-zero expenses found in given period, return empty array
    if (firstNonZeroIndex === -1) {
      return [];
    } else {  // Crop the beginning of the array to only include the non-zero expenses
      expenses = expenses.slice(firstNonZeroIndex);
    }


    return expenses;
  }
}
