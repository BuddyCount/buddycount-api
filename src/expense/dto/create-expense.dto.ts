import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, ExpenseCategory, PaidDetails } from 'src/utils/types';

let paidByExample: PaidDetails = {
    repartitionType: "AMOUNT",
    repartition: [
        {
            userId: 1,
            values: {
                amount: 100,
            },
        },
    ],
}

let paidForExample: PaidDetails = {
    repartitionType: "PORTIONS",
    repartition: [
        {
            userId: 1,
            values: {
                share: 1,
            },
        },
        {
            userId: 2,
            values: {
                share: 1,
            },
        },
    ],
}

export class CreateExpenseDto {

    @ApiProperty({
        description: 'The id of the group',
        example: '2f9ace4b-9698-403e-b573-11ed9a3f22e0',
    })
    groupId: string;

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
        example: paidByExample,
    })
    paidBy: PaidDetails;

    @ApiProperty({
        description: 'The paid for details',
        example: paidForExample,
    })
    paidFor: PaidDetails;
}
