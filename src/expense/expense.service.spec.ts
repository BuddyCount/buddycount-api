import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { Expense } from './entities/expense.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseService, {
        provide: getRepositoryToken(Expense),
        useValue: {
          // create: jest.fn(),
          // save: jest.fn(),
          // findAll: jest.fn(),
        },
      }],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
