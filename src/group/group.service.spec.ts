import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { Repository } from 'typeorm';
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
        }
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    repo = module.get(getRepositoryToken(Group));
    imageService = module.get(ImageService);
    expenseService = module.get(ExpenseService);
  });

  describe('create', () => {
    it('should create and save a group', async () => {
      const dto: CreateGroupDto = { name: 'Test Group' } as any;
      const created = { id: '1', ...dto } as Group;

      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      const group = { id: '1', name: 'Test' } as Group;
      repo.findOne.mockResolvedValue(group);

      const result = await service.findOne('1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(group);
    });
  });

  describe('getGroupMemberIds', () => {
    it('should return empty array if no group found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([]);
    });

    it('should return empty array if group has no users', async () => {
      repo.findOne.mockResolvedValue({ id: '1', users: null } as any);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([]);
    });

    it('should return array of user ids if group has users', async () => {
      const group = {
        id: '1',
        users: [{ id: 10 }, { id: 20 }],
      } as any;
      repo.findOne.mockResolvedValue(group);

      const result = await service.getGroupMemberIds('1');

      expect(result).toEqual([10, 20]);
    });
  });

  describe('update', () => {
    it('should update a group by id', async () => {
      const dto: UpdateGroupDto = { name: 'Updated' } as any;
      const updateResult = { affected: 1 } as any;
      repo.update.mockResolvedValue(updateResult);

      const result = await service.update('1', dto);

      expect(repo.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should delete a group by id', async () => {
      const deleteResult = { affected: 1 } as any;
      (expenseService.findAll as jest.Mock).mockResolvedValue([]);
      repo.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('1');

      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });
  });

  describe('join', () => {
    it('should return group id when linkToken matches', async () => {
      const group = { id: '1' } as any;
      repo.findOne.mockResolvedValue(group);

      const result = await service.join('token123');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { linkToken: 'token123' },
        select: ['id'],
      });
      expect(result).toEqual(group);
    });

    it('should return null if no group found with linkToken', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.join('badtoken');

      expect(result).toBeNull();
    });
  });
});
