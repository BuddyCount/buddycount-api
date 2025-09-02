import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { UpdateExpenseDto } from './dto/update-expense.dto';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: jest.Mocked<ExpenseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get(ExpenseService);
  });

  describe('findOne', () => {
    it('should call service.findOne with numeric id and return result', async () => {
      const expense = { id: 1, description: 'Dinner', amount: 50 } as any;
      service.findOne.mockResolvedValue(expense);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expense);
    });

    it('should throw if service.findOne fails', async () => {
      service.findOne.mockRejectedValue(new Error('DB error'));

      await expect(controller.findOne('1')).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    it('should call service.update with numeric id and return result', async () => {
      const dto: UpdateExpenseDto = { description: 'Updated', amount: 100 } as any;
      const updated = { affected: 1 } as any;
      service.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw if service.update fails', async () => {
      const dto: UpdateExpenseDto = { description: 'Updated', amount: 100 } as any;
      service.update.mockRejectedValue(new Error('DB error'));

      await expect(controller.update('1', dto)).rejects.toThrow('DB error');
    });
  });

  describe('remove', () => {
    it('should call service.remove with numeric id and return result', async () => {
      const deleted = { affected: 1 } as any;
      service.remove.mockResolvedValue(deleted);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleted);
    });

    it('should throw if service.remove fails', async () => {
      service.remove.mockRejectedValue(new Error('DB error'));

      await expect(controller.remove('1')).rejects.toThrow('DB error');
    });
  });
});
