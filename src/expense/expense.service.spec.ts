import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
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
  let imageService: Partial<jest.Mocked<ImageService>>;

  beforeEach(async () => {
    imageService = {
      getImage: jest.fn(),
      deleteImage: jest.fn(),
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

    service = module.get<ExpenseService>(ExpenseService);
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
    } as CreateExpenseDto;

    // Test that expense is created successfully with valid data
    it('should create expense successfully', async () => {
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      (imageService.getImage as jest.Mock).mockResolvedValue({});
      repo.create.mockReturnValue(baseDto as Expense);
      repo.save.mockResolvedValue({ id: 'exp1', ...baseDto } as Expense);

      const result = await service.create(baseDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');

      expect(imageService.getImage).toHaveBeenCalledWith('img1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(baseDto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual({ id: 'exp1', ...baseDto });
    });

    // Test creation when paidFor repartitionType is PORTIONS
    it('should create expense successfully with paidFor repartitionType PORTIONS', async () => {
      const dto: CreateExpenseDto = {
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
      } as CreateExpenseDto;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1, 2]);
      (imageService.getImage as jest.Mock).mockResolvedValue({});
      repo.create.mockReturnValue(dto as Expense);
      repo.save.mockResolvedValue({ id: 'exp2', ...dto } as Expense);

      const result = await service.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');

      expect(imageService.getImage).toHaveBeenCalledWith('img1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'exp2', ...dto });
    });

    // Test that create throws if groupId is missing
    it('should throw if groupId missing', async () => {
      const dto = { amount: 100 } as CreateExpenseDto;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    // Test that create throws if users are not part of the group
    it('should throw if users are not in group', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 2, values: { amount: 100 } }],
        },
        paidFor: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 2, values: { amount: 100 } }],
        },
      } as CreateExpenseDto;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    // Test that create throws if image is not found
    it('should throw if image not found', async () => {
      (imageService.getImage as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    // Test that create throws if a user share has neither amount nor share defined
    it('should throw if a UserShareDto has neither amount nor share defined', async () => {
      const dto: CreateExpenseDto = {
        groupId: '1',
        amount: 100,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: {} }], // missing amount
        },
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: {} }], // missing share
        },
      } as CreateExpenseDto;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    // ----------------- VALIDATE PAID EDGE CASES -----------------
    it('should throw if paidBy repartitionType is PORTIONS', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: 1 } }],
        },
      } as CreateExpenseDto;
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
      } as unknown as CreateExpenseDto;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidBy amounts do not sum to total', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidBy: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as CreateExpenseDto;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidFor amounts do not sum to total', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'AMOUNT',
          repartition: [{ userId: 1, values: { amount: 50 } }],
        },
      } as CreateExpenseDto;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if paidFor shares are negative', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: -1 } }],
        },
      } as CreateExpenseDto;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if total shares < 1', async () => {
      const dto: CreateExpenseDto = {
        ...baseDto,
        paidFor: {
          repartitionType: 'PORTIONS',
          repartition: [{ userId: 1, values: { share: 0 } }],
        },
      } as CreateExpenseDto;
      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ----------------- FIND ALL -----------------
  // Test that all expenses for a group are returned
  describe('findAll', () => {
    it('should return all expenses', async () => {
      const expenses: Expense[] = [
        { id: 'a3850469-6b37-425c-96cc-9e352dac28e1', groupId: '1' } as Expense,
      ];
      repo.find.mockResolvedValue(expenses);

      const result = await service.findAll('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.find).toHaveBeenCalledWith({ where: { groupId: '1' } });
      expect(result).toEqual(expenses);
    });
  });

  // ----------------- FIND ONE -----------------
  // Test that a single expense is returned
  describe('findOne', () => {
    it('should return single expense', async () => {
      const expense: Expense = {
        id: 'a3850469-6b37-425c-96cc-9e352dac28e1',
      } as Expense;
      repo.findOne.mockResolvedValue(expense);

      const result = await service.findOne(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'a3850469-6b37-425c-96cc-9e352dac28e1' },
      });
      expect(result).toEqual(expense);
    });
  });

  // ----------------- UPDATE -----------------
  describe('update', () => {
    // Test successful update of an expense
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
      } as UpdateExpenseDto;

      (groupService.getGroupMemberIds as jest.Mock).mockResolvedValue([1]);
      repo.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      const result = await service.update(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
        dto,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(groupService.getGroupMemberIds).toHaveBeenCalledWith('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.update).toHaveBeenCalledWith(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
        dto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    // Test that update throws if groupId is missing
    it('should throw if groupId missing', async () => {
      const dto: UpdateExpenseDto = { amount: 100 } as UpdateExpenseDto;
      await expect(
        service.update('a3850469-6b37-425c-96cc-9e352dac28e1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ----------------- REMOVE -----------------
  describe('remove', () => {
    // Test that an expense is deleted and associated images are removed
    it('should delete expense', async () => {
      repo.findOne.mockResolvedValue({ images: ['img1'] } as Expense);
      repo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.remove(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );

      expect(imageService.deleteImage).toHaveBeenCalledWith('img1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.delete).toHaveBeenCalledWith(
        'a3850469-6b37-425c-96cc-9e352dac28e1',
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
