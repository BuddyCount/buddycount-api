import { Group } from 'src/group/entities/group.entity';
import { Currency, ExpenseCategory, PaidDetails } from 'src/utils/types';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name: string;

    @Column({ type: 'enum', enum: ExpenseCategory })
    category: ExpenseCategory;

    @Column({ type: 'enum', enum: Currency })
    currency: Currency;

    // @Column({ type: 'decimal', precision: 15, scale: 8 }) // TODO: use decimal for this and amount ?
    @Column()
    exchange_rate: number;

    @Column()
    date: Date;

    // @Column({ type: 'decimal', precision: 10, scale: 2 })
    @Column()
    amount: number;

    @Column('simple-json')
    paidBy: PaidDetails;

    @Column('simple-json')
    paidFor: PaidDetails;

    /* Metadata, auto-generated */
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @VersionColumn()
    version: number;

    /* Relations */

    // Group
    @ManyToMany(() => Group, (group) => group.expenses)
    @JoinTable()
    groups: Group[];
}
