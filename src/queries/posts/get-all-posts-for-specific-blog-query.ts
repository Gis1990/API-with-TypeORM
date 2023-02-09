import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewModelClassPagination } from "../../entities/posts.entity";
import { ModelForGettingAllPosts } from "../../dtos/posts.dto";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { PostsFactory } from "../../factories/posts.factory";

export class GetAllPostsForSpecificBlogCommand {
    constructor(public dto: ModelForGettingAllPosts, public blogId: string, public userId: number | undefined) {}
}

@QueryHandler(GetAllPostsForSpecificBlogCommand)
export class GetAllPostsForSpecificBlogQuery implements IQueryHandler<GetAllPostsForSpecificBlogCommand> {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute(query: GetAllPostsForSpecificBlogCommand): Promise<PostViewModelClassPagination> {
        const result = await this.postsQueryRepository.getAllPostsForSpecificBlog(
            query.dto,
            Number(query.blogId),
            query.userId,
        );
        return await PostsFactory.createPostViewModelClassPagination(result);
    }
}
