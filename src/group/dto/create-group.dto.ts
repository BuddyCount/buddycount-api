import { ApiProperty } from "@nestjs/swagger";

export class CreateGroupDto {
    @ApiProperty({
        description: 'The name of the group',
        example: 'Family',
    })
    name: string;

    @ApiProperty({
        description: 'The description of the group',
        example: 'Family group',
    })
    description: string;
}
