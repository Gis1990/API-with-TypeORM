import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { CommentsClass } from "../../schemas/comments.schema";

export class GetCommentForIdValidationCommand {
    constructor(public readonly id: string) {}
}

@QueryHandler(GetCommentForIdValidationCommand)
export class GetCommentForIdValidationQuery implements IQueryHandler<GetCommentForIdValidationCommand> {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(query: GetCommentForIdValidationCommand): Promise<CommentsClass | null> {
        const userId = undefined;
        const comment = await this.commentsQueryRepository.getCommentById(query.id, userId);
        if (!comment) {
            return null;
        } else {
            return comment;
        }
    }
}
