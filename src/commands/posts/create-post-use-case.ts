import { InputModelForCreatingAndUpdatingPost } from "../../dtos/posts.dto";
import { PostViewModelClass } from "../../entities/posts.entity";
import { PostsRepository } from "../../repositories/posts.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { HttpException } from "@nestjs/common";
import { CurrentUserModel } from "../../dtos/auth.dto";
import { GetBlogByIdCommand } from "../../queries/blogs/get-blog-by-id-query";
import { PostsFactory } from "../../factories/posts.factory";

export class CreatePostCommand {
    constructor(public dto: InputModelForCreatingAndUpdatingPost, public user: CurrentUserModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(private queryBus: QueryBus, private postsRepository: PostsRepository) {}

    async execute(command: CreatePostCommand): Promise<PostViewModelClass> {
        const blog = await this.queryBus.execute(new GetBlogByIdCommand(command.dto.blogId));
        if (blog.blogOwnerUserId !== command.user.id) throw new HttpException("Access denied", 403);
        const createdPostDto = {
            title: command.dto.title,
            shortDescription: command.dto.shortDescription,
            content: command.dto.content,
            createdAt: new Date(),
            blogId: Number(command.dto.blogId),
            postOwnerUserId: Number(command.user.id),
            blogName: blog.name,
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
        };
        const createdPost = await this.postsRepository.createPost(createdPostDto);
        return await PostsFactory.createPostViewModelClass(createdPost);
    }
}
