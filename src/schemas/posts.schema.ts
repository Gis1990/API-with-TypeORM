import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PostsClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    shortDescription: string;

    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column()
    blogId: number;

    @Column()
    blogName: string;

    @Column()
    likesCount: number;

    @Column()
    dislikesCount: number;

    @Column()
    myStatus: string;

    @Column()
    postOwnerUserId: number;

    @Column()
    lastLikes: [];
}
