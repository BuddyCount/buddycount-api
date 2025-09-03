import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseService } from 'src/expense/expense.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(forwardRef(() => ExpenseService))
    private readonly expenseService: ExpenseService,
    private readonly imageService: ImageService,
  ) { }

  create(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  findOne(id: string) {
    return this.groupRepository.findOne({ where: { id } });
  }

  async getGroupMemberIds(id: string): Promise<number[]> {
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

  async remove(id: string) {
    const expenses = await this.expenseService.findAll(id);

    // Delete all images related to the expenses (if any)
    for (const expense of expenses) {
      if (!expense.images) {
        continue;
      }

      for (const image of expense.images) {
        this.imageService.deleteImage(image);
      }
    }

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
