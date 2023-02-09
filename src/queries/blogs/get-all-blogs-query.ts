import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { ModelForGettingAllBlogs } from "../../dtos/blogs.dto";
import { BlogsFactory } from "../../factories/blogs.factory";
import { BlogViewModelClassPagination } from "../../entities/blogs.entity";

export class GetAllBlogsCommand {
    constructor(public readonly dto: ModelForGettingAllBlogs) {}
}

@QueryHandler(GetAllBlogsCommand)
export class GetAllBlogsQuery implements IQueryHandler<GetAllBlogsCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(query: GetAllBlogsCommand): Promise<BlogViewModelClassPagination> {
        const result = await this.blogsQueryRepository.getAllBlogs(query.dto);
        return await BlogsFactory.createBlogViewModelPaginationClass(result);
    }
}
