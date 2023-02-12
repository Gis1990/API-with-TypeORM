import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { Posts } from "../../schemas/posts.schema";

export class GetPostByIdForLikeOperationCommand {
    constructor(public readonly id: string) {}
}

@QueryHandler(GetPostByIdForLikeOperationCommand)
export class GetPostByIdForLikeOperationQuery implements IQueryHandler<GetPostByIdForLikeOperationCommand> {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute(query: GetPostByIdForLikeOperationCommand): Promise<Posts | null> {
        return await this.postsQueryRepository.getPostByIdForOperationWithLikes(Number(query.id));
    }
}
