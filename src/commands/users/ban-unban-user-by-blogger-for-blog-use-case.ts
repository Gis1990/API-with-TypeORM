import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { UsersRepository } from "../../repositories/users.repository";
import { HttpException } from "@nestjs/common";
import { GetBlogByIdForBanUnbanOperationCommand } from "../../queries/blogs/get-blog-by-id-for-ban-unban-operation-query";

export class BanUnbanUserByBloggerForBlogCommand {
    constructor(
        public readonly isBanned: boolean,
        public readonly banReason: string,
        public readonly blogId: string,
        public readonly userId: number,
        public readonly blogOwnerUserId: number,
    ) {}
}

@CommandHandler(BanUnbanUserByBloggerForBlogCommand)
export class BanUnbanUserByBloggerForBlogUseCase implements ICommandHandler<BanUnbanUserByBloggerForBlogCommand> {
    constructor(private usersRepository: UsersRepository, private queryBus: QueryBus) {}

    async execute(command: BanUnbanUserByBloggerForBlogCommand): Promise<boolean> {
        const blog = await this.queryBus.execute(new GetBlogByIdForBanUnbanOperationCommand(command.blogId));
        if (Number(blog.blogOwnerUserId) !== command.blogOwnerUserId) throw new HttpException("Access denied", 403);
        return this.usersRepository.banUnbanUserByBloggerForBlog(
            command.isBanned,
            command.banReason,
            Number(command.blogId),
            command.userId,
        );
    }
}
