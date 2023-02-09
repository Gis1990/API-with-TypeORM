import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { CommentViewModelClass } from "../../entities/comments.entity";
import { CommentsFactory } from "../../factories/comments.factory";

export class GetCommentByIdCommand {
    constructor(public readonly id: string, public readonly userId: number | undefined) {}
}

@QueryHandler(GetCommentByIdCommand)
export class GetCommentByIdQuery implements IQueryHandler<GetCommentByIdCommand> {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(query: GetCommentByIdCommand): Promise<CommentViewModelClass> {
        const comment = await this.commentsQueryRepository.getCommentById(query.id, query.userId);
        if (!comment) return null;
        return CommentsFactory.createCommentViewModelClass(comment);
    }
}
