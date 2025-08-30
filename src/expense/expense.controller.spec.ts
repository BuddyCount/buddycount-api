import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { Expense } from './entities/expense.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupService } from '../group/group.service';


describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [ExpenseService, {
        provide: getRepositoryToken(Expense),
        useValue: {
          // create: jest.fn(),
          // save: jest.fn(),
          findAll: jest.fn(),
        },
      }
      , {
        provide: GroupService,
        useValue: {
          getGroupMemberIds: jest.fn().mockResolvedValue([1, 2]), // mock method
        },
      }
    ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an expense', async () => {
      const result = new Expense();
      jest.spyOn(service, 'findOne').mockImplementation(() => Promise.resolve(result));

      expect(await controller.findOne('1')).toBe(result);
    });
  });
});
