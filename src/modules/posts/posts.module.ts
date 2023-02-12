import { forwardRef, Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { PostsRepository } from "../../repositories/posts.repository";
import { BlogsModule } from "../blogs/blogs.module";
import { IsBlogsIdExistInTheRequestBodyConstraint } from "../../decorators/blogs/blogs.custom.decorators";
import { CommentsRepository } from "../../repositories/comments.repository";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { IsPostIdExistConstraint } from "../../decorators/posts/posts.custom.decorators";
import { DeletePostUseCase } from "../../commands/posts/delete-post-use-case";
import { UpdatePostUseCase } from "../../commands/posts/update-post-use-case";
import { LikeOperationForPostUseCase } from "../../commands/posts/like-operation-for-post-use-case";
import { CreateCommentUseCase } from "../../commands/comments/create-comment-use-case";
import { CqrsModule } from "@nestjs/cqrs";
import { GetBlogByIdQuery } from "../../queries/blogs/get-blog-by-id-query";
import { GetAllCommentsForSpecificPostQuery } from "../../queries/comments/get-all-comments-for-specific-post-query";
import { GetAllPostsQuery } from "../../queries/posts/get-all-posts-query";
import { GetPostByIdQuery } from "../../queries/posts/get-post-by-id-query";
import { GetPostByIdForLikeOperationQuery } from "../../queries/posts/get-post-by-id-for-like-opertation-query";
import { GetUserByIdQuery } from "../../queries/users/get-user-by-id-query";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { GetBannedBlogsForUserQuery } from "../../queries/blogs/get-banned-blogs-for-user-query";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../../schemas/users.schema";
import { Comments } from "../../schemas/comments.schema";
import { Posts } from "../../schemas/posts.schema";

const useCases = [UpdatePostUseCase, DeletePostUseCase, LikeOperationForPostUseCase, CreateCommentUseCase];
const queries = [
    GetBlogByIdQuery,
    GetAllCommentsForSpecificPostQuery,
    GetAllPostsQuery,
    GetPostByIdQuery,
    GetPostByIdForLikeOperationQuery,
    GetUserByIdQuery,
    GetBannedBlogsForUserQuery,
];

@Module({
    imports: [CqrsModule, forwardRef(() => BlogsModule), TypeOrmModule.forFeature([Users, Comments, Posts])],
    controllers: [PostsController],
    providers: [
        PostsRepository,
        PostsQueryRepository,
        CommentsRepository,
        CommentsQueryRepository,
        UsersQueryRepository,
        IsBlogsIdExistInTheRequestBodyConstraint,
        IsPostIdExistConstraint,
        ...useCases,
        ...queries,
    ],

    exports: [PostsQueryRepository, PostsRepository],
})
export class PostsModule {}
