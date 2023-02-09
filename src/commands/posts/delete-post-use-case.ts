import { PostsRepository } from "../../repositories/posts.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { HttpException } from "@nestjs/common";
import { GetBlogByIdCommand } from "../../queries/blogs/get-blog-by-id-query";
import { BlogClass } from "../../schemas/blogs.schema";

export class DeletePostCommand {
    constructor(public blogId: string, public postId: string, public userId: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
    constructor(private postsRepository: PostsRepository, private queryBus: QueryBus) {}

    async execute(command: DeletePostCommand): Promise<boolean> {
        const blog: BlogClass = await this.queryBus.execute(new GetBlogByIdCommand(command.blogId));
        if (Number(blog.blogOwnerUserId) !== command.userId) throw new HttpException("Access denied", 403);
        return this.postsRepository.deletePostById(Number(command.postId));
    }
}
