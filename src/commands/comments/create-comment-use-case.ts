import { CreatedCommentDto, ModelForCreatingNewComment } from "../../dtos/comments.dto";
import { CurrentUserModel } from "../../dtos/auth.dto";
import { CommentViewModelClass } from "../../entities/comments.entity";
import { CommentsRepository } from "../../repositories/comments.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { GetPostByIdCommand } from "../../queries/posts/get-post-by-id-query";
import { HttpException } from "@nestjs/common";
import { CommentsFactory } from "../../factories/comments.factory";
import { GetBannedBlogsForUserCommand } from "../../queries/blogs/get-banned-blogs-for-user-query";

export class CreateCommentCommand {
    constructor(
        public readonly dto: ModelForCreatingNewComment,
        public readonly postId: string,
        public readonly user: CurrentUserModel,
    ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
    constructor(private commentsRepository: CommentsRepository, private queryBus: QueryBus) {}

    async execute(command: CreateCommentCommand): Promise<CommentViewModelClass> {
        const post = await this.queryBus.execute(new GetPostByIdCommand(command.postId, command.user.id));
        const bannedBlogs = await this.queryBus.execute(new GetBannedBlogsForUserCommand(command.user.id));
        if (bannedBlogs.length > 0) {
            const blogIdsWhereUserIsBanned = bannedBlogs?.map((elem) => elem.blogId);
            if (blogIdsWhereUserIsBanned?.includes(Number(post.blogId))) throw new HttpException("Access denied", 403);
        }
        const createdCommentDto: CreatedCommentDto = {
            content: command.dto.content,
            createdAt: new Date(),
            commentatorOwnerUserId: Number(command.user.id),
            commentatorOwnerUserLogin: command.user.login,
            postId: Number(command.postId),
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
        };
        const createdComment = await this.commentsRepository.createComment(createdCommentDto);
        return CommentsFactory.createCommentViewModelClass(createdComment);
    }
}
