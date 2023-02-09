import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentViewModelForBloggerPaginationClass } from "../../entities/comments.entity";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { ModelForGettingAllComments } from "../../dtos/comments.dto";
import { CommentsFactory } from "../../factories/comments.factory";

export class GetAllCommentsForAllPostsForBloggersBlogsCommand {
    constructor(public readonly dto: ModelForGettingAllComments, public readonly userId: number | undefined) {}
}

@QueryHandler(GetAllCommentsForAllPostsForBloggersBlogsCommand)
export class GetAllCommentsForAllPostsForBloggersBlogsQuery
    implements IQueryHandler<GetAllCommentsForAllPostsForBloggersBlogsCommand>
{
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(
        query: GetAllCommentsForAllPostsForBloggersBlogsCommand,
    ): Promise<CommentViewModelForBloggerPaginationClass> {
        const comments = await this.commentsQueryRepository.getAllCommentsForAllPostsForBloggersBlogs(
            query.dto,
            query.userId,
        );
        return CommentsFactory.createCommentViewModelForBloggerPaginationClass(comments);
    }
}
