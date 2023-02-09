import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlogClass {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    websiteUrl: string;

    @Column()
    createdAt: Date;

    @Column()
    isBanned: boolean;

    @Column()
    banDate: Date;

    @Column()
    blogOwnerUserId: string;

    @Column()
    blogOwnerLogin: string;

    @Column()
    isMembership: boolean;
}
