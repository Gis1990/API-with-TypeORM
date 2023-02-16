import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ collation: "C", nullable: false })
    @Unique(["login"])
    login: string;

    @Column({ nullable: false })
    @Unique(["email"])
    email: string;

    @Column({ nullable: false })
    passwordHash: string;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    emailConfirmed: boolean;

    @Column({ nullable: false })
    emailConfirmationCode: string;

    @Column({ nullable: false })
    emailExpirationDate: Date;

    @Column({ nullable: true })
    emailRecoveryCode: string;

    @Column({ nullable: true })
    emailRecoveryExpirationDate: Date;

    @Column({ nullable: false })
    isBanned: boolean;

    @Column({ nullable: true })
    banDate: Date;

    @Column({ nullable: true })
    banReason: string;

    @Column({ nullable: true })
    currentSessionLastActiveDate: Date;

    @Column({ nullable: true })
    currentSessionDeviceId: string;

    @Column({ nullable: true })
    currentSessionIp: string;

    @Column({ nullable: true })
    currentSessionTitle: string;
}
