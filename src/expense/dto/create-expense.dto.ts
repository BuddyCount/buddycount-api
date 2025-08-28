import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, ExpenseCategory, PaidDetails } from 'src/utils/types';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 30)
    @ApiProperty({
        description: 'The name of the expense',
        example: 'Groceries',
    })
    name: string;

    @ApiProperty({
        description: 'The category of the expense',
        example: ExpenseCategory.FOOD,
    })
    category: ExpenseCategory;

    @ApiProperty({
        description: 'The currency of the expense',
        example: Currency.CHF,
    })
    currency: Currency;

    @ApiProperty({
        description: 'The exchange rate of the currency used for the expense (From currency of expense to currency of group)',
        example: 0.9363,
    })
    exchange_rate: number;

    @ApiProperty({
        description: 'The date of the expense',
        example: '2025-08-28',
    })
    date: Date;

    @ApiProperty({
        description: 'Amount in the currency of the expense',
        example: 100,
    })
    amount: number;

    @ApiProperty({
        description: 'The paid by details',
    })
    paidBy: PaidDetails;

    @ApiProperty({
        description: 'The paid for details',
    })
    paidFor: PaidDetails;
}
