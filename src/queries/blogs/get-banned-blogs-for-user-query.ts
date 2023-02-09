import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { BannedBlogsClass } from "../../schemas/users.schema";

export class GetBannedBlogsForUserCommand {
    constructor(public readonly userId: number) {}
}

@QueryHandler(GetBannedBlogsForUserCommand)
export class GetBannedBlogsForUserQuery implements IQueryHandler<GetBannedBlogsForUserCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(query: GetBannedBlogsForUserCommand): Promise<BannedBlogsClass> {
        return await this.blogsQueryRepository.getBannedBlogsForUser(query.userId);
    }
}
