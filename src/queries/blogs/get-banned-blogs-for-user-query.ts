import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { BannedBlogs } from "../../schemas/banned.blogs.schema";

export class GetBannedBlogsForUserCommand {
    constructor(public readonly userId: number) {}
}

@QueryHandler(GetBannedBlogsForUserCommand)
export class GetBannedBlogsForUserQuery implements IQueryHandler<GetBannedBlogsForUserCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(query: GetBannedBlogsForUserCommand): Promise<BannedBlogs[]> {
        return await this.blogsQueryRepository.getBannedBlogsForUser(query.userId);
    }
}
