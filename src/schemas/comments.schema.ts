import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./users.schema";
import { Posts } from "./posts.schema";

@Entity()
export class Comments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    content: string;

    @Column({ nullable: false })
    createdAt: Date;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "commentOwnerUserId" })
    commentUserId: Users;

    @Column({ type: "integer", nullable: false })
    commentOwnerUserId: number;

    @Column({ name: "commentOwnerUserLogin" })
    commentOwnerUserLogin: string;

    @ManyToOne(() => Posts)
    @JoinColumn({ name: "postId" })
    post: Posts;

    @Column({ type: "integer", nullable: false })
    postId: number;

    @Column({ nullable: false })
    likesCount: number;

    @Column({ nullable: false })
    dislikesCount: number;

    @Column({ nullable: false })
    myStatus: string;

    @Column({ type: "jsonb", default: () => "'[]'" })
    likesArray: Array<any>;

    @Column({ type: "jsonb", default: () => "'[]'" })
    dislikesArray: Array<any>;
}
