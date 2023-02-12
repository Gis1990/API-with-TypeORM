import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./users.schema";
import { Blogs } from "./blogs.schema";

@Entity()
export class Posts {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    title: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    shortDescription: string;

    @Column({ nullable: false })
    content: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    @ManyToOne(() => Blogs)
    @JoinColumn({ name: "blogId" })
    blog: Blogs;

    @Column({ nullable: false })
    blogId: number;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "postOwnerUserId" })
    postOwnerUser: Users;

    @Column({ nullable: false })
    postOwnerUserId: number;

    @Column({ nullable: false })
    blogName: string;
}
