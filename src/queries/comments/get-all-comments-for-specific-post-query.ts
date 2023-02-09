import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentViewModelPaginationClass } from "../../entities/comments.entity";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { ModelForGettingAllComments } from "../../dtos/comments.dto";
import { CommentsFactory } from "../../factories/comments.factory";

export class GetAllCommentsForSpecificPostCommand {
    constructor(
        public readonly dto: ModelForGettingAllComments,
        public readonly postId: string,
        public readonly userId: number | undefined,
    ) {}
}

@QueryHandler(GetAllCommentsForSpecificPostCommand)
export class GetAllCommentsForSpecificPostQuery implements IQueryHandler<GetAllCommentsForSpecificPostCommand> {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(query: GetAllCommentsForSpecificPostCommand): Promise<CommentViewModelPaginationClass> {
        const comments = await this.commentsQueryRepository.getAllCommentsForSpecificPost(
            query.dto,
            Number(query.postId),
            query.userId,
        );
        return await CommentsFactory.createCommentViewModelClassPagination(comments);
    }
}
