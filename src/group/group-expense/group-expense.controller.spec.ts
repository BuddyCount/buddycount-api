import { Test, TestingModule } from '@nestjs/testing';
import { GroupExpenseController } from './group-expense.controller';
import { ExpenseService } from 'src/expense/expense.service';
import { BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from 'src/expense/dto/create-expense.dto';

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
    it('should call service.create when groupId matches', async () => {
      const dto: CreateExpenseDto = { groupId: '1', description: 'Dinner', amount: 50 } as any;
      const created = { id: 'exp1', ...dto } as any;
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto, '1');

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException when groupId does not match', async () => {
      const dto: CreateExpenseDto = { groupId: '2', description: 'Dinner', amount: 50 } as any;

      expect(() => controller.create(dto, '1')).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return result', async () => {
      const expenses = [
        { id: 'exp1', groupId: '1', description: 'Dinner', amount: 50 },
      ] as any[];
      service.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll('1');

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expenses);
    });

    it('should throw if service.findAll fails', async () => {
      service.findAll.mockRejectedValue(new Error('DB error'));

      await expect(controller.findAll('1')).rejects.toThrow('DB error');
    });
  });
});
