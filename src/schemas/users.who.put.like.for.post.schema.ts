import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Posts } from "./posts.schema";

@Entity("usersWhoPutLikeForPost")
export class UsersWhoPutLikeForPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ type: "integer", nullable: false })
    postId: number;

    @Column({ nullable: true })
    addedAt: Date;

    @Column({ nullable: false })
    login: string;

    @ManyToOne(() => Posts)
    @JoinColumn({ name: "postId" })
    post: Posts;
}
