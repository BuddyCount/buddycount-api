import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 30)
    @ApiProperty({
        description: 'The name of the expense',
        example: 'Groceries',
    })
    name: string;
}
