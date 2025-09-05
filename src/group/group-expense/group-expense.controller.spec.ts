import { Test, TestingModule } from '@nestjs/testing';
import { GroupExpenseController } from './group-expense.controller';
import { ExpenseService } from 'src/expense/expense.service';
import { BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';
import { Expense } from 'src/expense/entities/expense.entity';
import { Currency, ExpenseCategory, RepartitionType } from 'src/utils/types';

describe('GroupExpenseController', () => {
  let controller: GroupExpenseController;
  let service: jest.Mocked<ExpenseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupExpenseController>(GroupExpenseController);
    service = module.get(ExpenseService);
  });

  describe('create', () => {
    // Test that service.create is called when groupId matches
    it('should call service.create when groupId matches', async () => {
      const dto: CreateExpenseDto = {
        groupId: '1',
        name: 'Dinner',
        category: ExpenseCategory.FOOD,
        currency: Currency.CHF,
        exchange_rate: 1.0,
        date: new Date(),
        amount: 50,
        paidBy: {
          repartitionType: RepartitionType.AMOUNT,
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
        paidFor: {
          repartitionType: RepartitionType.AMOUNT,
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as CreateExpenseDto;
      const created = { id: 'exp1', ...dto } as Expense;
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto, '1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    // Test that BadRequestException is thrown when groupId does not match
    it('should throw BadRequestException when groupId does not match', () => {
      const dto: CreateExpenseDto = {
        groupId: '2',
        name: 'Dinner',
        category: ExpenseCategory.FOOD,
        currency: Currency.CHF,
        exchange_rate: 1.0,
        date: new Date(),
        amount: 50,
        paidBy: {
          repartitionType: RepartitionType.AMOUNT,
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
        paidFor: {
          repartitionType: RepartitionType.AMOUNT,
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as CreateExpenseDto;

      expect(() => controller.create(dto, '1')).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    // Test that service.findAll is called and returns expenses
    it('should call service.findAll and return result', async () => {
      const expenses = [
        { id: 'exp1', groupId: '1', name: 'Dinner', amount: 50 } as Expense,
      ] as Expense[];
      service.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith('1');
      expect(result).toEqual(expenses);
    });

    // Test that findAll throws if service fails
    it('should throw if service.findAll fails', async () => {
      service.findAll.mockRejectedValue(new Error('DB error'));

      await expect(controller.findAll('1')).rejects.toThrow('DB error');
    });
  });
});
