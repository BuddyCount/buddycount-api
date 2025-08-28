import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Currency } from "src/utils/types";
import { Expense } from "src/expense/entities/expense.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'enum', enum: Currency })
    currency: Currency;

    // TODO: add icons, ...

    /* Relations */

    // Expense
    @ManyToMany(() => Expense, (expense) => expense.groups)
    expenses: Expense[];
}
