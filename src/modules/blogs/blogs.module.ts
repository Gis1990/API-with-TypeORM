import { Module } from "@nestjs/common";
import { BlogsRepository } from "../../repositories/blogs.repository";
import { BlogsController } from "./blogs.controller";
import {
    IsBlogsIdExistConstraint,
    IsBlogsIdExistInTheRequestBodyConstraint,
} from "../../decorators/blogs/blogs.custom.decorators";
import { BlogsQueryRepository } from "../../query-repositories/blogs.query.repository";
import { CreateBlogUseCase } from "../../commands/blogs/create-blog-use-case";
import { UpdateBlogUseCase } from "../../commands/blogs/update-blog-use-case";
import { DeleteBlogUseCase } from "../../commands/blogs/delete-blog-use-case";
import { CqrsModule } from "@nestjs/cqrs";
import { GetAllBlogsQuery } from "../../queries/blogs/get-all-blogs-query";
import { GetBlogByIdQuery } from "../../queries/blogs/get-blog-by-id-query";
import { GetBlogByIdWithCorrectViewModelQuery } from "../../queries/blogs/get-blog-by-id-with-correct-view-model-query";

import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { GetUserByIdQuery } from "../../queries/users/get-user-by-id-query";
import { GetAllPostsForSpecificBlogQuery } from "../../queries/posts/get-all-posts-for-specific-blog-query";
import { CreatePostUseCase } from "../../commands/posts/create-post-use-case";
import { PostsRepository } from "../../repositories/posts.repository";
import { PostsQueryRepository } from "../../query-repositories/posts.query.repository";

const useCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase, CreatePostUseCase];
const queries = [
    GetAllBlogsQuery,
    GetBlogByIdQuery,
    GetBlogByIdWithCorrectViewModelQuery,
    GetAllPostsForSpecificBlogQuery,
    GetUserByIdQuery,
];

@Module({
    imports: [CqrsModule],
    controllers: [BlogsController],
    providers: [
        BlogsRepository,
        BlogsQueryRepository,
        PostsRepository,
        PostsQueryRepository,
        UsersQueryRepository,
        IsBlogsIdExistConstraint,
        IsBlogsIdExistInTheRequestBodyConstraint,
        ...useCases,
        ...queries,
    ],
    exports: [BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
