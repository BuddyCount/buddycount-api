import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  findOne(id: string) {
    return this.groupRepository.findOne({ where: { id } });
  }

  async getGroupMemberIds(id: string): Promise<Number[]> {
    const group = await this.groupRepository.findOne({
      where: { id: id },
    });
    if (!group || !group.users) {
      return [];
    }
    return group.users.map((user: any) => user.id);
  }

  update(id: string, updateGroupDto: UpdateGroupDto) {
    return this.groupRepository.update(id, updateGroupDto);
  }

  remove(id: string) {
    return this.groupRepository.delete(id);
  }

  join(linkToken: string) {
    // TODO: check auth
    return this.groupRepository.findOne({
      where: { linkToken },
      select: ['id'],
    });
  }
}
