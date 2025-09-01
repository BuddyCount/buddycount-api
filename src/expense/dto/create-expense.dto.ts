import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, ExpenseCategory, RepartitionType } from 'src/utils/types';
import { Type } from 'class-transformer';

export class UserShareValuesDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'The amount of the user share. Only used for AMOUNT.',
        example: 100,
    })
    amount?: number; // only used for AMOUNT

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'The share of the user share. Only used for PORTIONS.',
        example: 1,
    })
    share?: number; // only used for PORTIONS
}

export class UserShareDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: 'The id of the user',
        example: 1,
    })
    userId: number;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The values of the user share',
        example: { amount: 100, share: 1 },
    })
    values: UserShareValuesDto;
}

export class PaidDetailsDto {
    @IsNotEmpty()
    @IsEnum(RepartitionType)
    @ApiProperty({
        description: 'The repartition type',
        example: RepartitionType.AMOUNT,
    })
    repartitionType: RepartitionType;

    @IsNotEmpty()
    @IsArray()
    @Type(() => UserShareDto)
    @ValidateNested({ each: true })
    @ApiProperty({
        description: 'The repartition',
        example: [{ userId: 1, values: { amount: 100 } }],
    })
    repartition: UserShareDto[];
}

let paidByExample: PaidDetailsDto = {
    repartitionType: RepartitionType.AMOUNT,
    repartition: [
        {
            userId: 1,
            values: {
                amount: 100,
            },
        },
    ],
}

let paidForExample: PaidDetailsDto = {
    repartitionType: RepartitionType.PORTIONS,
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
    @IsNotEmpty()
    @IsUUID(4)
    @ApiProperty({
        description: 'The id of the group',
        example: '2f9ace4b-9698-403e-b573-11ed9a3f22e0',
    })
    groupId: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    @ApiProperty({
        description: 'The name of the expense',
        example: 'Groceries',
    })
    name: string;

    @IsNotEmpty()
    @IsEnum(ExpenseCategory)
    @ApiProperty({
        description: 'The category of the expense',
        example: ExpenseCategory.FOOD,
    })
    category: ExpenseCategory;

    @IsNotEmpty()
    @IsEnum(Currency)
    @ApiProperty({
        description: 'The currency of the expense',
        example: Currency.CHF,
    })
    currency: Currency;

    @IsNotEmpty()
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @IsPositive()
    @ApiProperty({
        description: 'The exchange rate of the currency used for the expense (From currency of expense to currency of group)',
        example: 0.9363,
    })
    exchange_rate: number;

    @IsNotEmpty()
    @IsDateString()
    @ApiProperty({
        description: 'The date of the expense',
        example: '2025-08-28',
    })
    date: Date;

    @IsNotEmpty()
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @ApiProperty({
        description: 'Amount in the currency of the expense',
        example: 100,
    })
    amount: number;

    @IsNotEmpty()
    @Type(() => PaidDetailsDto)
    @ValidateNested()
    @ApiProperty({
        description: 'The paid by details',
        example: paidByExample,
    })
    paidBy: PaidDetailsDto;

    @IsNotEmpty()
    @Type(() => PaidDetailsDto)
    @ValidateNested()
    @ApiProperty({
        description: 'The paid for details',
        example: paidForExample,
    })
    paidFor: PaidDetailsDto;

    @ApiProperty({
        description: 'The images of the expense, if any',
        example: ['image1.jpg', 'image2.jpg'],
    })
    images: string[];
}
