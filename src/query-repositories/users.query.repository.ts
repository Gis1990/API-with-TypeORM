import { Injectable } from "@nestjs/common";
import { Users } from "../schemas/users.schema";
import {
    ModelForGettingAllBannedUsersForBlog,
    ModelForGettingAllUsers,
    UserModelClass,
    UsersClassPaginationDto,
} from "../dtos/users.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { Brackets, DataSource } from "typeorm";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Devices } from "../schemas/devices.schema";

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getAllUsers(dto: ModelForGettingAllUsers): Promise<UsersClassPaginationDto> {
        const {
            banStatus = "all",
            searchLoginTerm = null,
            searchEmailTerm = null,
            pageNumber = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortDirection = "desc",
        } = dto;

        const offset = pageSize * (pageNumber - 1);

        const queryBuilder = this.dataSource.createQueryBuilder().select("user").from(Users, "user");
        if (searchLoginTerm || searchEmailTerm) {
            queryBuilder.where(
                new Brackets((qb) => {
                    if (searchLoginTerm) {
                        qb.where("user.login ILIKE :searchLoginTerm", { searchLoginTerm: `%${searchLoginTerm}%` });
                    }
                    if (searchEmailTerm) {
                        qb.orWhere("user.email ILIKE :searchEmailTerm", { searchEmailTerm: `%${searchEmailTerm}%` });
                    }
                }),
            );
        }

        if (banStatus === "banned") {
            queryBuilder.andWhere("user.isBanned = true");
        } else if (banStatus === "notBanned") {
            queryBuilder.andWhere("user.isBanned = false");
        }

        queryBuilder.orderBy(`user.${sortBy}`, sortDirection === "desc" ? "DESC" : "ASC");

        const [users, totalCount] = await Promise.all([
            queryBuilder.limit(pageSize).offset(offset).getMany(),
            queryBuilder.getCount(),
        ]);
        console.log("users", users);
        console.log("totalCount", totalCount);
        return {
            pagesCount: Math.ceil(Number(totalCount) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount),
            items: users,
        };
    }

    async GetAllBannedUsersForBlog(
        dto: ModelForGettingAllBannedUsersForBlog,
        blogId: number,
    ): Promise<UsersClassPaginationDto> {
        const {
            searchLoginTerm = null,
            pageNumber = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortDirection = "desc",
        } = dto;

        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);

        const queryBuilder = await this.dataSource
            .getRepository(Users)
            .createQueryBuilder("u")
            .select("u.id")
            .addSelect("u.login")
            .addSelect("bb.isBanned", "u_isBanned")
            .addSelect("bb.banDate", "u_banDate")
            .addSelect("bb.banReason", "u_banReason")
            .innerJoin(BannedBlogs, "bb", "u.id = bb.userId")
            .where("bb.blogId = :blogId", { blogId })
            .andWhere("bb.isBanned = :isBanned", { isBanned: true });

        if (searchLoginTerm) {
            queryBuilder.andWhere("u.login ILIKE :searchLoginTerm", { searchLoginTerm: `%${searchLoginTerm}%` });
            queryBuilder.orderBy(`u.${sortBy}`, sort);
            queryBuilder.limit(pageSize).offset(offset);
        } else {
            const collate = sortBy === "login" ? ' COLLATE "C"' : "";
            queryBuilder.orderBy(`u.${sortBy}${collate}`, sort);
            queryBuilder.limit(pageSize).offset(offset);
        }

        const users = await queryBuilder.getRawMany();
        const totalCount = await queryBuilder.getCount();
        const correctUsers = users.map((user) => {
            const viewModel = {};
            Object.keys(user).forEach((key) => {
                viewModel[key.replace("u_", "")] = user[key];
            });
            return viewModel as Users;
        });
        return {
            pagesCount: Math.ceil(Number(totalCount) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount),
            items: correctUsers,
        };
    }

    async getUserById(id: number | undefined): Promise<UserModelClass | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        if (correctId >= 2147483647) {
            return null;
        }
        const user = await this.dataSource
            .createQueryBuilder()
            .select("user")
            .from(Users, "user")
            .where("user.id = :correctId", { correctId })
            .getOne();
        const devices = await this.dataSource
            .getRepository(Devices)
            .createQueryBuilder("d")
            .select(["d.ip", "d.lastActiveDate", "d.deviceId", "d.title"])
            .where("d.userId = :correctId", { correctId })
            .getRawMany();
        const correctDevices = devices.map((devices) => {
            const viewModel = {};
            Object.keys(devices).forEach((key) => {
                viewModel[key.replace("d_", "")] = devices[key];
            });
            return viewModel;
        });
        const bannedBlogs = await this.dataSource
            .createQueryBuilder()
            .select("bannedBlogs")
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctId", { correctId })
            .getMany();
        if (!user) {
            return null;
        }
        const correctUser = {
            id: user.id.toString(),
            login: user.login,
            email: user.email,
            userDevicesData: correctDevices,
            currentSession: {
                ip: user.currentSessionIp,
                lastActiveDate: user.currentSessionLastActiveDate,
                deviceId: user.currentSessionDeviceId,
                title: user.currentSessionTitle,
            },
            banInfo: {
                isBanned: user.isBanned,
                banDate: user.banDate,
                banReason: user.banReason,
            },
            banInfoForBlogs: bannedBlogs,
        };
        return correctUser;
    }

    async getUserByDeviceId(deviceId: string): Promise<UserModelClass | null> {
        const devices = await this.dataSource
            .createQueryBuilder()
            .select("devices")
            .from(Devices, "devices")
            .where("devices.deviceId = :deviceId", { deviceId })
            .getOne();
        if (!devices) {
            return null;
        }
        const userIdFromDevices = devices.userId;
        const user = await this.dataSource
            .createQueryBuilder()
            .select("user")
            .from(Users, "user")
            .where("user.id = :userIdFromDevices ", { userIdFromDevices })
            .getOne();
        if (!user) {
            return null;
        }
        const correctUser = {
            id: user.id.toString(),
            login: user.login,
            email: user.email,
            userDevicesData: devices,
            currentSession: {
                ip: user.currentSessionIp,
                lastActiveDate: user.currentSessionLastActiveDate,
                deviceId: user.currentSessionDeviceId,
                title: user.currentSessionTitle,
            },
            banInfo: {
                isBanned: user.isBanned,
                banDate: user.banDate,
                banReason: user.banReason,
            },
        };
        return correctUser;
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<Users | null> {
        const user = await this.dataSource
            .createQueryBuilder()
            .select("user")
            .from(Users, "user")
            .where("user.login = :loginOrEmail OR user.email = :loginOrEmail", { loginOrEmail })
            .getOne();
        return user || null;
    }

    async getUserByConfirmationCode(emailConfirmationCode: string): Promise<Users | null> {
        const user = await this.dataSource
            .createQueryBuilder()
            .select("user")
            .from(Users, "user")
            .where("user.emailConfirmationCode = :emailConfirmationCode", { emailConfirmationCode })
            .getOne();
        return user || null;
    }

    async getUserByRecoveryCode(recoveryCode: string): Promise<Users | null> {
        const user = await this.dataSource
            .createQueryBuilder()
            .select("user")
            .from(Users, "user")
            .where("user.emailRecoveryCode = :recoveryCode", { recoveryCode })
            .getOne();
        return user || null;
    }
}
