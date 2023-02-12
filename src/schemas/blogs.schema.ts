import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./users.schema";

@Entity()
export class Blogs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ collation: "C", nullable: false })
    name: string;

    @Column({ collation: "C", nullable: false })
    description: string;

    @Column({ nullable: false })
    websiteUrl: string;

    @Column({ type: "timestamp without time zone", nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    isBanned: boolean;

    @Column({ nullable: true })
    banDate: Date;

    @Column({ type: "integer", nullable: false })
    blogOwnerUserId: number;

    @Column({ nullable: false })
    blogOwnerLogin: string;

    @Column({ nullable: false })
    isMembership: boolean;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "blogOwnerUserId" })
    blogOwner: Users;
}
