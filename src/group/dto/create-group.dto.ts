import { ApiProperty } from "@nestjs/swagger";
import { Currency, UserIndex } from "src/utils/types";

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

    @ApiProperty({
        description: 'The currency of the group',
        example: 'CHF',
    })
    currency: Currency;

    @ApiProperty({
        description: 'The users of the group',
        example: [{ id: '1', name: 'John Doe' }],
    })
    users: UserIndex[];
}
