import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { ModelForGettingAllBannedUsersForBlog } from "../../dtos/users.dto";
import { UserViewModelForBannedUsersByBloggerPaginationClass } from "../../entities/users.entity";
import { GetBlogByIdForBanUnbanOperationCommand } from "../blogs/get-blog-by-id-for-ban-unban-operation-query";
import { HttpException } from "@nestjs/common";
import { UsersFactory } from "../../factories/users.factory";

export class GetAllBannedUsersForBlogCommand {
    constructor(
        public readonly dto: ModelForGettingAllBannedUsersForBlog,
        public readonly blogId: string,
        public readonly blogOwnerUserId: number,
    ) {}
}

@QueryHandler(GetAllBannedUsersForBlogCommand)
export class GetAllBannedUsersForBlogQuery implements IQueryHandler<GetAllBannedUsersForBlogCommand> {
    constructor(private usersQueryRepository: UsersQueryRepository, private queryBus: QueryBus) {}

    async execute(
        query: GetAllBannedUsersForBlogCommand,
    ): Promise<UserViewModelForBannedUsersByBloggerPaginationClass> {
        const blog = await this.queryBus.execute(new GetBlogByIdForBanUnbanOperationCommand(query.blogId));
        if (Number(blog.blogOwnerUserId) !== query.blogOwnerUserId) throw new HttpException("Access denied", 403);
        const users = await this.usersQueryRepository.GetAllBannedUsersForBlog(query.dto, Number(query.blogId));
        return await UsersFactory.createUserViewModelForBannedUsersByBloggerPaginationClass(users);
    }
}
