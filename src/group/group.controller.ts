import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Groups')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the group',
    required: true,
  })
  @ApiQuery({
    name: 'withExpenses',
    type: 'boolean',
    description: 'Whether to include expenses data in the response',
    required: true,
    example: true,
  })
  findOne(
    @Param('id') id: string,
    @Query('withExpenses', ParseBoolPipe) withExpenses: boolean,
  ) {
    return this.groupService.findOne(id, withExpenses);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the group',
    required: true,
  })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the group',
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Get('join/:linkToken')
  @ApiParam({
    name: 'linkToken',
    type: 'string',
    description: 'The token used to join the group',
    required: true,
  })
  join(@Param('linkToken') linkToken: string) {
    return this.groupService.join(linkToken);
  }

  @Get(':id/predict')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The uuid of the group',
    required: true,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    format: 'date-time',
    description: 'The start date for the prediction analysis',
    required: true,
    example: '2025-08-01',
  })
  @ApiQuery({
    name: 'predictionLength',
    type: 'integer',
    description: 'Number of days to predict',
    required: true,
    example: 7,
  })
  predict(
    @Param('id') id: string,
    @Query('startDate') startDate: Date,
    @Query('predictionLength') predictionLength: number,
  ) {
    return this.groupService.predictGroupExpenses(
      id,
      startDate,
      predictionLength,
    );
  }
}
