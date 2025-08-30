import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, ValidateNested } from "class-validator";
import { Currency, UserIndex } from "src/utils/types";
import { Type } from "class-transformer";

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    @ApiProperty({
        description: 'The name of the group',
        example: 'Family',
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    @ApiProperty({
        description: 'The description of the group',
        example: 'Family group',
    })
    description: string;

    @IsNotEmpty()
    @IsEnum(Currency)
    @ApiProperty({
        description: 'The currency of the group',
        example: Currency.CHF,
    })
    currency: Currency;

    @IsNotEmpty()
    @IsArray()
    @Type(() => UserIndex)
    @ValidateNested({ each: true })
    @ApiProperty({
        description: 'The users of the group',
        example: [{ id: 1, name: 'John Doe' }],
    })
    users: UserIndex[];
}
