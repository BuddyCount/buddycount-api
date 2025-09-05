import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { UpdateResult, DeleteResult } from 'typeorm';

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
    // Test that findOne calls the service and returns the expected expense
    it('should call service.findOne with numeric id and return result', async () => {
      const expense = {
        id: 'a3850469-6b37-425c-96cc-9e352dac28e1',
        description: 'Dinner',
        amount: 50,
      } as unknown as Expense;
      service.findOne.mockResolvedValue(expense);

      const result = await controller.findOne(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );
      expect(result).toEqual(expense);
    });

    // Test that findOne throws if the service fails
    it('should throw if service.findOne fails', async () => {
      service.findOne.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.findOne('a3850469-6b37-425c-96cc-9e352dac28e1'),
      ).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    // Test that update calls the service with the DTO and returns result
    it('should call service.update with numeric id and return result', async () => {
      const dto: UpdateExpenseDto = {
        description: 'Updated',
        amount: 100,
      } as UpdateExpenseDto;
      const updated = { affected: 1 } as UpdateResult;
      service.update.mockResolvedValue(updated);

      const result = await controller.update(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
        dto,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
        dto,
      );
      expect(result).toEqual(updated);
    });

    // Test that update throws if the service fails
    it('should throw if service.update fails', async () => {
      const dto: UpdateExpenseDto = {
        description: 'Updated',
        amount: 100,
      } as UpdateExpenseDto;
      service.update.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.update('a3850469-6b37-425c-96cc-9e352dac28e1', dto),
      ).rejects.toThrow('DB error');
    });
  });

  describe('remove', () => {
    // Test that remove calls the service and returns the result
    it('should call service.remove with numeric id and return result', async () => {
      const deleted = { affected: 1 } as DeleteResult;
      service.remove.mockResolvedValue(deleted);

      const result = await controller.remove(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );
      expect(result).toEqual(deleted);
    });

    // Test that remove throws if the service fails
    it('should throw if service.remove fails', async () => {
      service.remove.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.remove('a3850469-6b37-425c-96cc-9e352dac28e1'),
      ).rejects.toThrow('DB error');
    });
  });
});
