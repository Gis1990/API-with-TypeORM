import { PostsRepository } from "../../repositories/posts.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { HttpException } from "@nestjs/common";
import { CurrentUserModel } from "../../dtos/auth.dto";
import { GetBlogByIdCommand } from "../../queries/blogs/get-blog-by-id-query";

export class UpdatePostCommand {
    constructor(
        public readonly postId: string,
        public readonly title: string,
        public readonly shortDescription: string,
        public readonly content: string,
        public readonly blogId: string,
        public readonly user: CurrentUserModel,
    ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
    constructor(private postsRepository: PostsRepository, private queryBus: QueryBus) {}

    async execute(command: UpdatePostCommand): Promise<boolean> {
        const blog = await this.queryBus.execute(new GetBlogByIdCommand(command.blogId));
        if (blog.blogOwnerUserId !== command.user.id) throw new HttpException("Access denied", 403);
        return this.postsRepository.updatePost(
            Number(command.postId),
            command.title,
            command.shortDescription,
            command.content,
            Number(command.blogId),
        );
    }
}
