import { PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number; // TODO: make it uuid instead ?
}
