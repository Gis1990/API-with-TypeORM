import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewModelClassPagination } from "../../entities/posts.entity";
import { ModelForGettingAllPosts } from "../../dtos/posts.dto";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { PostsFactory } from "../../factories/posts.factory";

export class GetAllPostsCommand {
    constructor(public readonly dto: ModelForGettingAllPosts, public readonly userId: string | undefined) {}
}

@QueryHandler(GetAllPostsCommand)
export class GetAllPostsQuery implements IQueryHandler<GetAllPostsCommand> {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute(query: GetAllPostsCommand): Promise<PostViewModelClassPagination> {
        const posts = await this.postsQueryRepository.getAllPosts(query.dto, query.userId);
        return await PostsFactory.createPostViewModelClassPagination(posts);
    }
}
