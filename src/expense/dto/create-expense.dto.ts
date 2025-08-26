import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    name: string;
}
