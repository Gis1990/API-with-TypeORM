import { forwardRef, Module } from "@nestjs/common";
import { CommentsRepository } from "../../repositories/comments.repository";
import { CommentsController } from "./comments.controller";
import { IsCommentsIdExistConstraint } from "../../decorators/comments/comments.custom.decorators";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { PostsModule } from "../posts/posts.module";
import { CreateCommentUseCase } from "../../commands/comments/create-comment-use-case";
import { UpdateCommentUseCase } from "../../commands/comments/update-comment-use-case";
import { DeleteCommentUseCase } from "../../commands/comments/delete-comment-use-case";
import { LikeOperationForCommentUseCase } from "../../commands/comments/like-operation-for-comment-use-case";
import { CqrsModule } from "@nestjs/cqrs";
import { GetCommentByIdQuery } from "../../queries/comments/get-comment-by-id-query";
import { GetCommentByIdForLikeOperationQuery } from "../../queries/comments/get-comment-by-id-for-like-operation-query";
import { GetAllCommentsForSpecificPostQuery } from "../../queries/comments/get-all-comments-for-specific-post-query";
import { GetCommentForIdValidationQuery } from "../../queries/comments/get-comment-for-id-validation-query";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";

const useCases = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase, LikeOperationForCommentUseCase];

const queries = [
    GetCommentByIdQuery,
    GetCommentByIdForLikeOperationQuery,
    GetAllCommentsForSpecificPostQuery,
    GetCommentForIdValidationQuery,
];

@Module({
    imports: [CqrsModule, forwardRef(() => PostsModule)],
    controllers: [CommentsController],
    providers: [
        CommentsRepository,
        CommentsQueryRepository,
        BlogsQueryRepository,
        UsersQueryRepository,
        IsCommentsIdExistConstraint,
        ...useCases,
        ...queries,
    ],
})
export class CommentsModule {}
