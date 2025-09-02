import { Group } from 'src/group/entities/group.entity';
import { Currency, ExpenseCategory } from 'src/utils/types';
import { PaidDetailsDto } from '../dto/create-expense.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

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
  @Column({ type: 'float' })
  exchange_rate: number;

  @Column()
  date: Date;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Column({ type: 'float' })
  amount: number;

  @Column('simple-json')
  paidBy: PaidDetailsDto;

  @Column('simple-json')
  paidFor: PaidDetailsDto;

  /* Metadata, auto-generated */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  /* Relations */

  @Column({ type: 'uuid' })
  groupId: string;

  // Group
  @ManyToOne(() => Group, (group) => group.expenses, { onDelete: 'CASCADE' })
  group: Group;
}
