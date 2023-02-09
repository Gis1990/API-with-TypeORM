import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommentsClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column()
    likesCount: number;

    @Column()
    dislikesCount: number;

    @Column()
    myStatus: string;

    @Column()
    commentOwnerUserId: number;

    @Column()
    commentOwnerUserLogin: string;

    @Column()
    postId: number;

    @Column()
    title: string;

    @Column()
    blogId: number;

    @Column()
    blogName: string;
}
