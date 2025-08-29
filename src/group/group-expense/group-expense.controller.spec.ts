import { Test, TestingModule } from '@nestjs/testing';
import { GroupExpenseController } from './group-expense.controller';
import { ExpenseService } from 'src/expense/expense.service';
import { Expense } from 'src/expense/entities/expense.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupService } from '../group.service';

describe('GroupExpenseController', () => {
  let controller: GroupExpenseController;
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupExpenseController],
      providers: [ExpenseService, {
        provide: getRepositoryToken(Expense),
        useValue: {
          findOne: jest.fn(),
        },

      }
      ,{
        provide: GroupService,
        useValue: {
          getGroupMemberIds: jest.fn().mockResolvedValue([1, 2]), // mock method
        },
      }
    ],
    }).compile();

    controller = module.get<GroupExpenseController>(GroupExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
