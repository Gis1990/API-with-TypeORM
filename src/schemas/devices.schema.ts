import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./users.schema";

@Entity()
export class Devices {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ nullable: false })
    ip: string;

    @Column({ type: "timestamp without time zone" })
    lastActiveDate: Date;

    @Column({ nullable: false })
    deviceId: string;

    @Column({ nullable: false })
    title: string;
}
