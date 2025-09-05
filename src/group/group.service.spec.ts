import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Group } from './entities/group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ImageService } from 'src/image/image.service';
import { ExpenseService } from 'src/expense/expense.service';

describe('GroupService', () => {
  let service: GroupService;
  let repo: jest.Mocked<Repository<Group>>;
  let imageService: Partial<ImageService>;
  let expenseService: Partial<ExpenseService>;

  beforeEach(async () => {
    imageService = {
      getImage: jest.fn(),
      deleteImage: jest.fn(),
    };
    expenseService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ImageService,
          useValue: imageService,
        },
        {
          provide: ExpenseService,
          useValue: expenseService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    repo = module.get(getRepositoryToken(Group));
    imageService = module.get(ImageService);
    expenseService = module.get(ExpenseService);
  });

  describe('create', () => {
    // Test that a group is created and saved in the repository
    it('should create and save a group', async () => {
      const dto: CreateGroupDto = { name: 'Test Group' } as CreateGroupDto;
      const created = { id: '1', ...dto } as Group;

      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    // Test that group can be fetched by id without relations
    it('should return a group by id', async () => {
      const group = { id: '1', name: 'Test' } as Group;
      repo.findOne.mockResolvedValue(group);

      const result = await service.findOne('1', false);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: [],
      });
      expect(result).toEqual(group);
    });

    // Test that group can be fetched by id including its expenses
    it('should return a group by id with its expenses', async () => {
      const group = { id: '1', name: 'Test' } as Group;
      repo.findOne.mockResolvedValue(group);

      const result = await service.findOne('1', true);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['expenses'],
      });
      expect(result).toEqual(group);
    });
  });

  describe('getGroupMemberIds', () => {
    // Test returns empty array if group not found
    it('should return empty array if no group found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([]);
    });

    // Test returns empty array if group has no users
    it('should return empty array if group has no users', async () => {
      repo.findOne.mockResolvedValue({
        id: '1',
        users: null,
      } as unknown as Group);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([]);
    });

    // Test returns array of user ids if group has users
    it('should return array of user ids if group has users', async () => {
      const group = {
        id: '1',
        users: [{ id: 10 }, { id: 20 }],
      } as Group;
      repo.findOne.mockResolvedValue(group);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([10, 20]);
    });
  });

  describe('update', () => {
    // Test that group is updated by id
    it('should update a group by id', async () => {
      const dto: UpdateGroupDto = { name: 'Updated' } as UpdateGroupDto;
      const updateResult = { affected: 1 } as UpdateResult;
      repo.update.mockResolvedValue(updateResult);

      const result = await service.update('1', dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    // Test that group is deleted by id
    it('should delete a group by id', async () => {
      const deleteResult = { affected: 1 } as DeleteResult;
      (expenseService.findAll as jest.Mock).mockResolvedValue([]);
      repo.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });
  });

  describe('join', () => {
    // Test that group is returned when linkToken matches
    it('should return group id when linkToken matches', async () => {
      const group = { id: '1' } as Group;
      repo.findOne.mockResolvedValue(group);

      const result = await service.join('token123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { linkToken: 'token123' },
        select: ['id'],
      });
      expect(result).toEqual(group);
    });

    // Test that null is returned if no group found with linkToken
    it('should return null if no group found with linkToken', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.join('badtoken');

      expect(result).toBeNull();
    });
  });
});
