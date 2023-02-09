import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UsersClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    createdAt: Date;

    @Column()
    emailConfirmed: boolean;

    @Column()
    emailConfirmationCode: string;

    @Column()
    emailExpirationDate: Date;

    @Column()
    emailRecoveryCode: string;

    @Column()
    emailRecoveryExpirationDate: Date;

    @Column()
    isBanned: boolean;

    @Column()
    banDate: Date;

    @Column()
    banReason: string;

    @Column()
    lastActiveDate: Date;

    @Column()
    deviceId: string;

    @Column()
    ip: string;

    @Column()
    title: string;
}

@Entity()
export class BannedBlogsClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    blogId: number;

    @Column()
    isBanned: boolean;

    @Column()
    banDate: Date;

    @Column()
    banReason: string;
}

@Entity()
export class DevicesClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    ip: string;

    @Column()
    lastActiveDate: Date;

    @Column()
    deviceId: string;

    @Column()
    title: string;
}

@Entity()
export class LoginAttemptsClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    attemptDate: Date;

    @Column()
    ip: string;
}
