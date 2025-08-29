import { Test, TestingModule } from '@nestjs/testing';
import { GroupExpenseController } from './group-expense.controller';

describe('GroupExpenseController', () => {
  let controller: GroupExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupExpenseController],
    }).compile();

    controller = module.get<GroupExpenseController>(GroupExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
