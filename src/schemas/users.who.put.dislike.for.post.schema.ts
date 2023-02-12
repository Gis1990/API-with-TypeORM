import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Posts } from "./posts.schema";

@Entity("usersWhoPutDislikeForPost")
export class UsersWhoPutDislikeForPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false })
    postId: number;

    @Column({ nullable: true })
    addedAt: Date;

    @Column({ nullable: false })
    login: string;

    @ManyToOne(() => Posts)
    @JoinColumn({ name: "postId" })
    post: Posts;
}
