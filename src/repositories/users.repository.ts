import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { BanInfoClass, CreatedNewUserDto } from "../dtos/users.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UsersClass } from "../schemas/users.schema";

@Injectable()
export class UsersRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async userConfirmedEmail(id: number): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE users SET "emailConfirmed" = true WHERE id = $1 RETURNING id`,
            [id],
        );
        return result[1] > 0;
    }

    async updateConfirmationCode(id: number): Promise<boolean> {
        const newConfirmationCode = uuidv4();
        const result = await this.dataSource.query(
            `UPDATE users SET "emailConfirmationCode" = $1 WHERE id = $2 RETURNING id`,
            [newConfirmationCode, id],
        );
        return result[1] > 0;
    }

    async addLoginAttempt(id: number, ip: string): Promise<boolean> {
        const date = new Date();
        const result = await this.dataSource.query(
            `INSERT INTO "loginAttempts" ("userId", "attemptDate", ip) VALUES($1, $2, $3) RETURNING id`,
            [id, date, ip],
        );
        return !!result[0].id;
    }

    async addPasswordRecoveryCode(id: number, passwordRecoveryData: string, expirationDate: Date): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE users SET "emailRecoveryCode" = $1, "emailExpirationDate" = $2 WHERE id = $3 RETURNING id`,
            [passwordRecoveryData, expirationDate, id],
        );
        return result[1] > 0;
    }

    async updatePasswordHash(id: number, passwordHash: string): Promise<boolean> {
        const result = await this.dataSource.query(`UPDATE users SET "passwordHash" = $1 WHERE id = $2 RETURNING id`, [
            passwordHash,
            id,
        ]);
        return result[1] > 0;
    }

    async addUserDevicesData(
        id: number,
        ip: string,
        lastActiveDate: Date,
        deviceId: string,
        title: string,
    ): Promise<boolean> {
        if (!title) {
            title = "Unknown";
        }
        const result = await this.dataSource.query(
            `INSERT INTO devices ("userId", ip, "lastActiveDate", "deviceId", title) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [id, ip, lastActiveDate, deviceId, title],
        );
        return !!result[0].id;
    }

    async addCurrentSession(
        id: number,
        ip: string,
        lastActiveDate: Date,
        deviceId: string,
        title: string,
    ): Promise<boolean> {
        if (!title) {
            title = "Unknown";
        }
        const result = await this.dataSource.query(
            `UPDATE users SET "currentSessionLastActiveDate" = $1,"currentSessionIp" = $2, "currentSessionDeviceId" = $3, "currentSessionTitle" = $4 WHERE id = $5 RETURNING id`,
            [lastActiveDate, ip, deviceId, title, id],
        );
        return result[1] > 0;
    }

    async updateLastActiveDate(deviceId: string, newLastActiveDate: Date): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE devices SET "lastActiveDate" = $1 WHERE "deviceId" = $2 RETURNING "userId"`,
            [newLastActiveDate, deviceId],
        );
        const userId = result[0][0].userId;
        await this.dataSource.query(`UPDATE users SET "currentSessionLastActiveDate" = $1 WHERE id = $2`, [
            newLastActiveDate,
            userId,
        ]);
        return result[1] > 0;
    }

    async terminateAllDevices(id: number, deviceId: string): Promise<boolean> {
        const result = await this.dataSource.query(
            `DELETE FROM devices WHERE "userId" = $1 AND "deviceId" !=$2 RETURNING id`,
            [id, deviceId],
        );
        return result[1] > 0;
    }

    async terminateSpecificDevice(deviceId: string): Promise<boolean> {
        const result = await this.dataSource.query(`DELETE FROM devices WHERE "deviceId" = $1 RETURNING id`, [
            deviceId,
        ]);
        return result[1] > 0;
    }

    async createUser(newUser: CreatedNewUserDto): Promise<UsersClass> {
        const result = await this.dataSource.query(
            `INSERT INTO users (login, email, "passwordHash", "createdAt", "emailConfirmed", "emailConfirmationCode", "emailExpirationDate",
            "emailRecoveryCode", "emailRecoveryExpirationDate", "isBanned", "banDate", "banReason", "currentSessionLastActiveDate", "currentSessionDeviceId",
             "currentSessionIp", "currentSessionTitle")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                newUser.login,
                newUser.email,
                newUser.passwordHash,
                newUser.createdAt,
                newUser.emailConfirmed,
                newUser.emailConfirmationCode,
                newUser.emailExpirationDate,
                newUser.emailRecoveryCode,
                newUser.emailRecoveryExpirationDate,
                newUser.isBanned,
                newUser.banDate,
                newUser.banReason,
                newUser.currentSessionLastActiveDate,
                newUser.currentSessionDeviceId,
                newUser.currentSessionIp,
                newUser.currentSessionTitle,
            ],
        );
        return result[0];
    }

    async deleteUserById(id: number): Promise<boolean> {
        await this.dataSource.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
        await this.dataSource.query(`DELETE FROM devices WHERE "userId" = $1 RETURNING id`, [id]);
        await this.dataSource.query(`DELETE FROM "loginAttempts" WHERE "userId" = $1 RETURNING id`, [id]);
        const result = await this.dataSource.query(`DELETE FROM "bannedBlogs" WHERE "userId" = $1 RETURNING id`, [id]);
        return result[1] > 0;
    }

    async banUnbanUserBySuperAdmin(banData: BanInfoClass, userId: number): Promise<boolean> {
        await this.dataSource.query(`DELETE FROM devices WHERE "userId" = $1 RETURNING id`, [userId]);
        const result = await this.dataSource.query(
            `UPDATE users SET "isBanned" = $1, "banDate" = $2, "banReason" = $3 WHERE id = $4 RETURNING id`,
            [banData.isBanned, banData.banDate, banData.banReason, userId],
        );
        return result[1] > 0;
    }

    async banUnbanUserByBloggerForBlog(
        isBanned: boolean,
        banReason: string,
        blogId: number,
        userId: number,
    ): Promise<boolean> {
        let result;
        const blogIsAlreadyBanned = await this.dataSource.query(
            `SELECT * FROM "bannedBlogs" WHERE "userId" = $1 AND "blogId" = $2 AND "isBanned" = true`,
            [userId, blogId],
        );
        if (!!blogIsAlreadyBanned[0] && isBanned) {
            return true;
        }
        if (isBanned) {
            const date = new Date();
            result = await this.dataSource.query(
                `INSERT INTO "bannedBlogs" ("userId", "blogId", "isBanned", "banDate", "banReason") VALUES ($1,$2,true,$3,$4) RETURNING id`,
                [userId, blogId, date, banReason],
            );
            return !!result[0];
        } else {
            result = await this.dataSource.query(`DELETE FROM "bannedBlogs" WHERE "userId" = $1 RETURNING id`, [
                userId,
            ]);
            return result[1] > 0;
        }
    }
}
