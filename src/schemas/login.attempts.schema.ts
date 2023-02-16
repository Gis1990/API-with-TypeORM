import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./users.schema";

@Entity("loginAttempts")
export class LoginAttempts {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "integer", nullable: false })
    userId: number;

    @Column({ nullable: false })
    attemptDate: Date;

    @Column({ nullable: false })
    ip: string;
}
