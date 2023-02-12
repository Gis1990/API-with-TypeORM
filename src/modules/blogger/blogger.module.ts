import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DeleteBlogUseCase } from "../../commands/blogs/delete-blog-use-case";
import { UpdateBlogUseCase } from "../../commands/blogs/update-blog-use-case";
import { CreateBlogUseCase } from "../../commands/blogs/create-blog-use-case";
import { BlogsRepository } from "../../repositories/blogs.repository";
import {
    IsBlogsIdExistConstraint,
    IsBlogsIdExistInTheRequestBodyConstraint,
} from "../../decorators/blogs/blogs.custom.decorators";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { BloggerController } from "./blogger.controller";
import { GetAllBlogsForAuthorizedUserQuery } from "../../queries/blogs/get-all-blogs-for-authorized-user-query";
import { GetAllUsersQuery } from "../../queries/users/get-all-users-query";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { GetUserByIdQuery } from "../../queries/users/get-user-by-id-query";
import { BanUnbanUserByBloggerForBlogUseCase } from "../../commands/users/ban-unban-user-by-blogger-for-blog-use-case";
import { UsersRepository } from "../../repositories/users.repository";
import { GetAllBannedUsersForBlogQuery } from "../../queries/users/get-all-banned-users-for-blog-query";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";
import { CommentsQueryRepository } from "../../query-repositories/comments.query.repository";
import { PostsRepository } from "../../repositories/posts.repository";
import { GetAllCommentsForAllPostsForBloggersBlogsQuery } from "../../queries/comments/get-all-comments-for-all-posts-for-blogs-query";
import { UpdatePostUseCase } from "../../commands/posts/update-post-use-case";
import { CreatePostUseCase } from "../../commands/posts/create-post-use-case";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../../schemas/users.schema";
import { Blogs } from "../../schemas/blogs.schema";
import { Comments } from "../../schemas/comments.schema";
import { Posts } from "../../schemas/posts.schema";
import { UsersWhoPutLikeForPost } from "../../schemas/users.who.put.like.for.post.schema";
import { UsersWhoPutDislikeForPost } from "../../schemas/users.who.put.dislike.for.post.schema";

const useCases = [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    BanUnbanUserByBloggerForBlogUseCase,
];
const queries = [
    GetAllBlogsForAuthorizedUserQuery,
    GetAllUsersQuery,
    GetUserByIdQuery,
    GetAllCommentsForAllPostsForBloggersBlogsQuery,
    GetAllBannedUsersForBlogQuery,
];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Users, Blogs, Posts, Comments, UsersWhoPutDislikeForPost, UsersWhoPutLikeForPost]),
    ],
    controllers: [BloggerController],
    providers: [
        BlogsRepository,
        BlogsQueryRepository,
        PostsQueryRepository,
        UsersRepository,
        UsersQueryRepository,
        CommentsQueryRepository,
        PostsRepository,
        IsBlogsIdExistConstraint,
        IsBlogsIdExistInTheRequestBodyConstraint,
        ...useCases,
        ...queries,
    ],
})
export class BloggerModule {}
