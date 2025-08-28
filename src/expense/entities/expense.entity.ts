import { Group } from 'src/group/entities/group.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name: string;

    /* Relations */

    // Group
    @ManyToMany(() => Group, (group) => group.expenses)
    @JoinTable()
    groups: Group[];
}
