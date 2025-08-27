import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Currency } from "src/utils/types";

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
}
