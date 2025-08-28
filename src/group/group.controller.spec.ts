import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [GroupService, {
        provide: getRepositoryToken(Group),
        useValue: {
          findOne: jest.fn(),
        },
      }],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a group', async () => {
      const result = new Group();
      jest.spyOn(service, 'findOne').mockImplementation(() => Promise.resolve(result));

      expect(await controller.findOne('1')).toBe(result);
    });
  });
});
