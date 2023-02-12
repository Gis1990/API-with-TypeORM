import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { Comments } from "../../schemas/comments.schema";

export class GetCommentByIdForLikeOperationCommand {
    constructor(public readonly id: string) {}
}

@QueryHandler(GetCommentByIdForLikeOperationCommand)
export class GetCommentByIdForLikeOperationQuery implements IQueryHandler<GetCommentByIdForLikeOperationCommand> {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(query: GetCommentByIdForLikeOperationCommand): Promise<Comments> {
        return await this.commentsQueryRepository.getCommentByIdForLikeOperation(Number(query.id));
    }
}
