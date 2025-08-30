export enum Currency {
    CHF = 'CHF',
    EUR = 'EUR',
    USD = 'USD',
}

export enum ExpenseCategory {
    FOOD = 'FOOD',
    TRANSPORT = 'TRANSPORT',
    HOUSING = 'HOUSING',
    UTILITIES = 'UTILITIES',
    OTHER = 'OTHER',
}


export type UserIndex = {
    id: number;
    name: string;
}

export type UserShare = {
    userId: number;
    values: {
        amount?: number; // only used for AMOUNT
        share?: number; // only used for PORTIONS
    }
}

export class PaidDetails {
    repartitionType: 'PORTIONS' | 'AMOUNT';
    repartition: UserShare[];
}