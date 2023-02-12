import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Users } from "./users.schema";

@Entity("bannedBlogs")
export class BannedBlogs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false })
    blogId: number;

    @Column({ nullable: false })
    isBanned: boolean;

    @Column({ nullable: false })
    banDate: Date;

    @Column({ nullable: false })
    banReason: string;

    @OneToOne(() => Users)
    @JoinColumn({ name: "userId" })
    user: Users;
}
