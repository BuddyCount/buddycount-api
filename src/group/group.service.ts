import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateGroupDto, UserIndexDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseService } from 'src/expense/expense.service';
import { ImageService } from 'src/image/image.service';
import { differenceInCalendarDays } from 'date-fns';
import { getAugumentedDataset } from "src/types/holtwinters";
import { MIN_EXPENSES_TO_PREDICT, PREDICTION_CUTOFF_AMOUNT } from 'src/utils/constants';

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

  /* 
   * Predict future expenses for a given group using Holt-Winters algorithm
   * @param groupId - The id of the group
   * @param startDate - The start date of the prediction
   * @param predictionLength - The length of the prediction
   * @returns The predicted expenses
   */
  async predictGroupExpenses(groupId: string, startDate: Date, predictionLength: number) {
    // Validate predictionLength
    if (predictionLength < 1 || !Number.isInteger(predictionLength)) {
      throw new BadRequestException('Prediction length must be at least 1 and an integer');
    }

    let expenses = await this.parseGroupExpenses(groupId, startDate);
    console.log('expenses', expenses);

    // Make sure there is enough data to predict. Add 2 * predictionLength to account for the extra data needed to predict as predictionLength increases
    if (expenses.length < MIN_EXPENSES_TO_PREDICT + 2 * predictionLength) {
      throw new BadRequestException('Not enough expenses to predict in given period, or too many predicted expenses wanted');
    }

    const predictedExpenses = getAugumentedDataset(expenses, predictionLength);
    console.log(predictedExpenses);

    if (!predictedExpenses) {
      throw new InternalServerErrorException('Could not predict future expenses');
    }

    // Keep only the predicted expenses
    predictedExpenses.augumentedDataset = predictedExpenses.augumentedDataset.slice(expenses.length);

    // Truncate to 2 decimal places and remove any values less than PREDICTION_CUTOFF_AMOUNT
    for (let i = 0; i < predictedExpenses.augumentedDataset.length; i++) {
      if ((predictedExpenses.augumentedDataset[i] as number) < PREDICTION_CUTOFF_AMOUNT) {
        predictedExpenses.augumentedDataset[i] = 0;
      }

      predictedExpenses.augumentedDataset[i] = Math.trunc((predictedExpenses.augumentedDataset[i] as number) * 100) / 100;
    }

    return predictedExpenses.augumentedDataset;
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
      where: { id: groupId, expenses: { date: MoreThanOrEqual(startDate) } },
      relations: ['expenses'],
    });

    if (!group) {
      throw new BadRequestException('Group not found');
    }

    const expensesWithDates = group.expenses.map((expense) => ({
      amount: expense.amount,
      date: expense.date,
    }));

    console.log(expensesWithDates);

    // Create array of expenses with 0 for each day
    let expenses = new Array<number>(differenceInCalendarDays(new Date(), startDate)).fill(0);

    // Populate array with expenses
    for (let i = 0; i < expensesWithDates.length; i++) {
      const index = differenceInCalendarDays(expensesWithDates[i].date, startDate) - 1;
      expenses[index] += expensesWithDates[i].amount;  // Cumulate expenses of the same day
    }

    console.log(expenses);

    // Keep only from first non-zero expense to the end + add a small amount to the null expenses
    let firstNonZeroIndex = -1;
    for (let i = 0; i < expenses.length; i++) {
      if (firstNonZeroIndex === -1 && expenses[i] > 0) {
        firstNonZeroIndex = i;
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
