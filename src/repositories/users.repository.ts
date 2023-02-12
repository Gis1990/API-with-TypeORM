import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { BanInfoClass, CreatedNewUserDto } from "../dtos/users.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Users } from "../schemas/users.schema";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Devices } from "../schemas/devices.schema";
import { LoginAttempts } from "../schemas/login.attempts.schema";

@Injectable()
export class UsersRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async userConfirmedEmail(id: number): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({ emailConfirmed: true })
            .where("id = :id", { id })
            .execute();
        return result.affected > 0;
    }

    async updateConfirmationCode(id: number): Promise<boolean> {
        const newConfirmationCode = uuidv4();
        const result = await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({ emailConfirmationCode: newConfirmationCode })
            .where("id = :id", { id })
            .execute();
        return result.affected > 0;
    }

    async addLoginAttempt(id: number, ip: string): Promise<boolean> {
        const date = new Date();
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("loginAttempts")
            .values({
                userId: id,
                attemptDate: date,
                ip: ip,
            })
            .returning("id")
            .execute();
        return !!result.raw[0];
    }

    async addPasswordRecoveryCode(id: number, passwordRecoveryData: string, expirationDate: Date): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({ emailRecoveryCode: passwordRecoveryData, emailExpirationDate: expirationDate })
            .where("id = :id", { id })
            .returning("id")
            .execute();
        return result.affected > 0;
    }

    async updatePasswordHash(id: number, passwordHash: string): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({ passwordHash: passwordHash })
            .where("id = :id", { id })
            .returning("id")
            .execute();
        return result.affected > 0;
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
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("devices")
            .values({
                userId: id,
                ip,
                lastActiveDate,
                deviceId,
                title,
            })
            .returning("*")
            .execute();
        return !!result.raw[0];
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
        const result = await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({
                currentSessionLastActiveDate: lastActiveDate,
                currentSessionIp: ip,
                currentSessionDeviceId: deviceId,
                currentSessionTitle: title,
            })
            .where("id = :id", { id })
            .execute();
        return result.affected > 0;
    }

    async updateLastActiveDate(deviceId: string, newLastActiveDate: Date): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("devices")
            .set({ lastActiveDate: newLastActiveDate })
            .where("deviceId = :deviceId", { deviceId })
            .returning("*")
            .execute();
        const userId = result.raw.userId;
        await this.dataSource
            .createQueryBuilder()
            .update("users")
            .set({ currentSessionLastActiveDate: newLastActiveDate })
            .where("id = :userId", { userId })
            .execute();
        return result.affected > 0;
    }

    async terminateAllDevices(id: number, deviceId: string): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(Devices)
            .where("deviceId = :deviceId", { deviceId })
            .andWhere("userId = :id", { id })
            .execute();
        return result.affected > 0;
    }

    async terminateSpecificDevice(deviceId: string): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(Devices)
            .where("deviceId = :deviceId", { deviceId })
            .execute();
        return result.affected > 0;
    }

    async createUser(newUser: CreatedNewUserDto): Promise<Users> {
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("users")
            .values({
                login: newUser.login,
                email: newUser.email,
                passwordHash: newUser.passwordHash,
                createdAt: newUser.createdAt,
                emailConfirmed: newUser.emailConfirmed,
                emailConfirmationCode: newUser.emailConfirmationCode,
                emailExpirationDate: newUser.emailExpirationDate,
                emailRecoveryCode: newUser.emailRecoveryCode,
                emailRecoveryExpirationDate: newUser.emailRecoveryExpirationDate,
                isBanned: newUser.isBanned,
                banDate: newUser.banDate,
                banReason: newUser.banReason,
                currentSessionLastActiveDate: newUser.currentSessionLastActiveDate,
                currentSessionDeviceId: newUser.currentSessionDeviceId,
                currentSessionIp: newUser.currentSessionIp,
                currentSessionTitle: newUser.currentSessionTitle,
            })
            .returning("*")
            .execute();
        return result.raw[0];
    }

    async deleteUserById(id: number): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(Users)
            .where("id = :id", { id })
            .execute();
        await this.dataSource.createQueryBuilder().delete().from(Devices).where("userId = :id", { id }).execute();
        await this.dataSource.createQueryBuilder().delete().from(LoginAttempts).where("userId = :id", { id }).execute();
        await this.dataSource.createQueryBuilder().delete().from(BannedBlogs).where("userId = :id", { id }).execute();
        return result.affected > 0;
    }

    async banUnbanUserBySuperAdmin(banData: BanInfoClass, userId: number): Promise<boolean> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(Devices)
            .where("userId = :userId", { userId })
            .execute();
        const result = await this.dataSource
            .createQueryBuilder()
            .update(Users)
            .set({
                isBanned: banData.isBanned,
                banDate: banData.banDate,
                banReason: banData.banReason,
            })
            .where("id = :userId", { userId })
            .execute();

        return result.affected > 0;
    }

    async banUnbanUserByBloggerForBlog(
        isBanned: boolean,
        banReason: string,
        blogId: number,
        userId: number,
    ): Promise<boolean> {
        const blogIsAlreadyBanned = await this.dataSource
            .getRepository(BannedBlogs)
            .createQueryBuilder("bannedBlogs")
            .where("bannedBlogs.userId = :userId", { userId })
            .andWhere("bannedBlogs.blogId = :blogId", { blogId })
            .andWhere("bannedBlogs.isBanned = :isBanned", { isBanned: true })
            .getOne();

        if (blogIsAlreadyBanned && isBanned) {
            return true;
        }

        if (isBanned) {
            const date = new Date();
            const bannedBlog = new BannedBlogs();
            bannedBlog.userId = userId;
            bannedBlog.blogId = blogId;
            bannedBlog.isBanned = true;
            bannedBlog.banDate = date;
            bannedBlog.banReason = banReason;

            const result = await this.dataSource.getRepository(BannedBlogs).save(bannedBlog);
            return !!result.id;
        } else {
            const result = await this.dataSource
                .createQueryBuilder()
                .delete()
                .from(BannedBlogs)
                .where("userId = :userId", { userId })
                .execute();

            return result.affected > 0;
        }
    }
}
