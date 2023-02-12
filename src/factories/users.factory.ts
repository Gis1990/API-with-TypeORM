import {
    UserViewModelClass,
    UserViewModelClassPagination,
    UserViewModelForBannedUsersByBloggerClass,
    UserViewModelForBannedUsersByBloggerPaginationClass,
} from "../entities/users.entity";
import { Users } from "../schemas/users.schema";
import { UsersClassPaginationDto } from "../dtos/users.dto";

export class UsersFactory {
    static async createUserViewModelClass(user: Users): Promise<UserViewModelClass> {
        return new UserViewModelClass(user.id.toString(), user.login, user.email, user.createdAt, {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason,
        });
    }

    static async createUserViewModelPaginationClass(
        dto: UsersClassPaginationDto,
    ): Promise<UserViewModelClassPagination> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return UsersFactory.createUserViewModelClass(elem);
            }),
        );
        return new UserViewModelClassPagination(dto.pagesCount, dto.page, dto.pageSize, dto.totalCount, result);
    }

    static async createUserViewModelForBannedUsersByBloggerPaginationClass(
        dto: UsersClassPaginationDto,
    ): Promise<UserViewModelForBannedUsersByBloggerPaginationClass> {
        const correctCursor = [];
        dto.items.forEach((user) => {
            const banData = {
                isBanned: user.isBanned,
                banDate: user.banDate,
                banReason: user.banReason,
            };
            correctCursor.push(new UserViewModelForBannedUsersByBloggerClass(user.id.toString(), user.login, banData));
        });
        return new UserViewModelForBannedUsersByBloggerPaginationClass(
            dto.pagesCount,
            dto.page,
            dto.pageSize,
            dto.totalCount,
            correctCursor,
        );
    }
}
