import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { ModelForGettingAllBlogs } from "../../dtos/blogs.dto";
import { BlogViewModelClassPagination } from "../../entities/blogs.entity";
import { BlogsFactory } from "../../factories/blogs.factory";

export class GetAllBlogsForAuthorizedUserCommand {
    constructor(public readonly dto: ModelForGettingAllBlogs, public readonly userId: number) {}
}

@QueryHandler(GetAllBlogsForAuthorizedUserCommand)
export class GetAllBlogsForAuthorizedUserQuery implements IQueryHandler<GetAllBlogsForAuthorizedUserCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(query: GetAllBlogsForAuthorizedUserCommand): Promise<BlogViewModelClassPagination> {
        const result = await this.blogsQueryRepository.getAllBlogsForAuthorizedUser(query.dto, Number(query.userId));
        return await BlogsFactory.createBlogViewModelPaginationClass(result);
    }
}
