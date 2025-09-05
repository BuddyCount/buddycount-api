import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { UpdateResult, DeleteResult } from 'typeorm';

describe('GroupController', () => {
  let controller: GroupController;
  let service: jest.Mocked<GroupService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            join: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get(GroupService);
  });

  describe('create', () => {
    // Test that service.create is called and returns the created group
    it('should call service.create and return result', async () => {
      const dto: CreateGroupDto = { name: 'Test Group' } as CreateGroupDto;
      const created = { id: '1', ...dto } as Group;
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    // Test that create throws if service.create fails
    it('should throw if service.create fails', async () => {
      const dto: CreateGroupDto = { name: 'Test Group' } as CreateGroupDto;
      service.create.mockRejectedValue(new Error('DB error'));

      await expect(controller.create(dto)).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    // Test that service.findOne returns the requested group
    it('should call service.findOne and return group', async () => {
      const group = { id: '1', name: 'Test' } as Group;
      service.findOne.mockResolvedValue(group);

      const result = await controller.findOne('1', false);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith('1', false);
      expect(result).toEqual(group);
    });

    // Test that findOne throws if service.findOne fails
    it('should throw if service.findOne fails', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('1', false)).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    // Test that service.update is called and returns update result
    it('should call service.update and return result', async () => {
      const dto: UpdateGroupDto = { name: 'Updated' } as UpdateGroupDto;
      const updated = { affected: 1 } as UpdateResult;
      service.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updated);
    });

    // Test that update throws if service.update fails
    it('should throw if service.update fails', async () => {
      const dto: UpdateGroupDto = { name: 'Updated' } as UpdateGroupDto;
      service.update.mockRejectedValue(new Error('DB error'));

      await expect(controller.update('1', dto)).rejects.toThrow('DB error');
    });
  });

  describe('remove', () => {
    // Test that service.remove is called and returns delete result
    it('should call service.remove and return result', async () => {
      const deleted = { affected: 1 } as DeleteResult;
      service.remove.mockResolvedValue(deleted);

      const result = await controller.remove('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleted);
    });

    // Test that remove throws if service.remove fails
    it('should throw if service.remove fails', async () => {
      service.remove.mockRejectedValue(new Error('DB error'));

      await expect(controller.remove('1')).rejects.toThrow('DB error');
    });
  });

  describe('join', () => {
    // Test that service.join is called with a token and returns the joined group
    it('should call service.join and return result', async () => {
      const group = { id: '1' } as Group;
      service.join.mockResolvedValue(group);

      const result = await controller.join('token123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.join).toHaveBeenCalledWith('token123');
      expect(result).toEqual(group);
    });

    // Test that join throws if service.join fails
    it('should throw if service.join fails', async () => {
      service.join.mockRejectedValue(new Error('DB error'));

      await expect(controller.join('token123')).rejects.toThrow('DB error');
    });
  });
});
