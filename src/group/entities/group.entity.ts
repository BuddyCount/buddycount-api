import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    // TODO: add icons, ...
}
