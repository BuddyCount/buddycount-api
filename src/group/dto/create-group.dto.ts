import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Currency } from 'src/utils/types';
import { Type } from 'class-transformer';

export class UserIndexDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The id of the user',
    example: 1,
  })
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;
}

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @ApiProperty({
    description: 'The name of the group',
    example: 'Family',
  })
  name: string;

  @IsOptional()
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
    enum: Currency,
    required: true,
  })
  currency: Currency;

  @IsNotEmpty()
  @IsArray()
  @Type(() => UserIndexDto)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'The users of the group',
    example: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ],
  })
  users: UserIndexDto[];
}
