import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, {
        provide: getRepositoryToken(Group),
        useValue: {
          findOne: jest.fn(),
        },
      }],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a group', async () => {
      const result = new Group();
      jest.spyOn(service, 'findOne').mockImplementation(() => Promise.resolve(result));

      expect(await service.findOne('1')).toBe(result);
    });
  });
});
