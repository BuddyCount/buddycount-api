import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Currency } from 'src/utils/types';
import { Expense } from 'src/expense/entities/expense.entity';
import { UserIndexDto } from '../dto/create-group.dto';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('uuid')
  linkToken: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column('simple-json')
  users: UserIndexDto[];

  /* Metadata, auto-generated */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // TODO: add icons, ...

  /* Relations */

  // Expense
  @OneToMany(() => Expense, (expense) => expense.group)
  expenses: Expense[];
}
