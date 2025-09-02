import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupService } from '../group/group.service';
import { ImageService } from '../image/image.service';
import { BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let repo: jest.Mocked<Repository<Expense>>;
  let groupService: jest.Mocked<GroupService>;
  let imageService: Partial<ImageService>;

  beforeEach(async () => {
    imageService = {
      getImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getRepositoryToken(Expense),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: GroupService,
          useValue: {
            getGroupMemberIds: jest.fn(),
          },
        },
        {
          provide: ImageService,
          useValue: imageService,
        },
      ],
    }).compile();

    service = module.get(ExpenseService);
    repo = module.get(getRepositoryToken(Expense));
    groupService = module.get(GroupService);
    imageService = module.get(ImageService);
  });

  // ----------------- CREATE -----------------
  describe('create', () => {
    const baseDto: CreateExpenseDto = {
      groupId: '1',
      amount: 100,
      paidBy: {
        repartitionType: 'AMOUNT',
        repartition: [{ userId: 1, values: { amount: 100 } }],
      },
      paidFor: {
        repartitionType: 'AMOUNT',
        repartition: [{ userId: 1, values: { amount: 100 } }],
      },
      images: ['img1'],
    } as any;

    it('should create expense successfully', async () => {
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      (imageService.getImage as jest.Mock).mockResolvedValue({});
      repo.create.mockReturnValue(baseDto as any);
      repo.save.mockResolvedValue({ id: 'exp1', ...baseDto } as any);

      const result = await service.create(baseDto);

      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');
      expect(imageService.getImage).toHaveBeenCalledWith('img1');
      expect(repo.create).toHaveBeenCalledWith(baseDto);
      expect(repo.save).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual({ id: 'exp1', ...baseDto });
    });

    it('should create expense successfully with paidFor repartitionType PORTIONS', async () => {
      const dto = {
        groupId: '1',
        amount: 100,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 100 } }],
        },
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [
            { userId: 1, values: { share: 1 } },
            { userId: 2, values: { share: 1 } },
          ],
        },
        images: ['img1'],
      } as any;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1, 2]);
      (imageService.getImage as jest.Mock).mockResolvedValue({});
      repo.create.mockReturnValue(dto as any);
      repo.save.mockResolvedValue({ id: 'exp2', ...dto } as any);

      const result = await service.create(dto);

      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');
      expect(imageService.getImage).toHaveBeenCalledWith('img1');
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'exp2', ...dto });
    });

    it('should throw if groupId missing', async () => {
      const dto = { amount: 100 } as any;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if users are not in group', async () => {
      const dto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 2, values: { amount: 100 } }],
        },
        paidFor: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 2, values: { amount: 100 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if image not found', async () => {
      (imageService.getImage as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    // ----------------- VALIDATE PAID EDGE CASES -----------------
    it('should throw if paidBy repartitionType is PORTIONS', async () => {
      const dto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: 1 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidFor repartitionType is invalid', async () => {
      const dto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'INVALID',
          repartition: [{ userId: 1, values: { amount: 100 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidBy amounts do not sum to total', async () => {
      const dto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidFor amounts do not sum to total', async () => {
      const dto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidFor shares are negative', async () => {
      const dto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: -1 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if total shares < 1', async () => {
      const dto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: 0 } }],
        },
      } as any;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ----------------- FIND ALL -----------------
  describe('findAll', () => {
    it('should return all expenses', async () => {
      const expenses = [{ id: 1 }] as any[];
      repo.find.mockResolvedValue(expenses);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(expenses);
    });
  });

  // ----------------- FIND ONE -----------------
  describe('findOne', () => {
    it('should return single expense', async () => {
      const expense = { id: 1 } as any;
      repo.findOne.mockResolvedValue(expense);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expense);
    });
  });

  // ----------------- UPDATE -----------------
  describe('update', () => {
    it('should update expense successfully', async () => {
      const dto: UpdateExpenseDto = {
        groupId: '1',
        amount: 100,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 100 } }],
        },
        paidFor: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 100 } }],
        },
      } as any;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      repo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, dto);

      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');
      expect(repo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw if groupId missing', async () => {
      const dto: UpdateExpenseDto = { amount: 100 } as any;
      await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ----------------- REMOVE -----------------
  describe('remove', () => {
    it('should delete expense', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });
  });
});
