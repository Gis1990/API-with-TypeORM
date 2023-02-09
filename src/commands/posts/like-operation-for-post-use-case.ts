import { PostsRepository } from "../../repositories/posts.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { GetPostByIdForLikeOperationCommand } from "../../queries/posts/get-post-by-id-for-like-opertation-query";

export class LikeOperationForPostCommand {
    constructor(
        public readonly id: string,
        public readonly userId: number,
        public readonly login: string,
        public readonly likeStatus: string,
    ) {}
}

@CommandHandler(LikeOperationForPostCommand)
export class LikeOperationForPostUseCase implements ICommandHandler<LikeOperationForPostCommand> {
    constructor(private postsRepository: PostsRepository, private queryBus: QueryBus) {}

    async execute(command: LikeOperationForPostCommand): Promise<boolean> {
        const post = await this.queryBus.execute(new GetPostByIdForLikeOperationCommand(command.id));
        if (!post) {
            return false;
        }
        const isLiked = post.likesArray.map((user) => user.userId).includes(Number(command.userId));
        const isDisliked = post.dislikesArray.map((user) => user.userId).includes(Number(command.userId));
        let updateParams;
        let updateParams2;
        let update;
        let update2;
        let doubleOperation;
        // If the user wants to like the post and has not already liked or disliked it,
        // Add the user to the list of users who liked the post
        if (command.likeStatus === "Like" && !isLiked && !isDisliked) {
            update = `INSERT INTO "usersWhoPutLikeForPost" (login, "userId", "addedAt","postId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = false;
        }
        // If the user wants to dislike the post and has not already liked or disliked it,
        // Add the user to the list of users who disliked the post
        else if (command.likeStatus === "Dislike" && !isDisliked && !isLiked) {
            update = `INSERT INTO "usersWhoPutDislikeForPost" (login, "userId", "addedAt","postId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = false;
        }
        // If the user wants to change his status to None,but don't have like or dislike status
        else if (command.likeStatus === "None" && !isDisliked && !isLiked) {
            return true;
        }
        // If the user wants to like the comment and has already liked it,
        else if (command.likeStatus === "Like" && isLiked) {
            return true;
        }
        // If the user wants to dislike the comment and has already disliked it,
        else if (command.likeStatus === "Dislike" && isDisliked) {
            return true;
        }
        // If the user wants to change his status to None and has already liked the post,
        // Remove the user from the list of users who liked the post,
        else if (command.likeStatus === "None" && isLiked) {
            update = `DELETE FROM "usersWhoPutLikeForPost" WHERE "postId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [Number(command.id), command.userId];
            doubleOperation = false;
        }
        // If the user wants to change his status to None and has already disliked the post,
        // Remove the user from the list of users who disliked the post,
        else if (command.likeStatus === "None" && isDisliked) {
            update = `DELETE FROM "usersWhoPutDislikeForPost" WHERE "postId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [Number(command.id), command.userId];
            doubleOperation = false;
        }
        // If the user has already liked the post and wants to dislike it,
        // Remove the user from the list of users who liked the post, and add them to the list of users who disliked the post
        else if (isLiked && command.likeStatus === "Dislike") {
            update = `DELETE FROM "usersWhoPutLikeForPost" WHERE "postId" =$1 AND "userId" = $2`;
            updateParams = [Number(command.id), command.userId];
            update2 = `INSERT INTO "usersWhoPutDislikeForPost" (login, "userId", "addedAt","postId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams2 = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = true;
        }

        // If the user has already disliked the post and wants to like it,
        // Remove the user from the list of users who disliked the post, and add them to the list of users who liked the post
        else if (isDisliked && command.likeStatus === "Like") {
            update = `DELETE FROM "usersWhoPutDislikeForPost" WHERE "postId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [command.id, command.userId];
            update2 = `INSERT INTO "usersWhoPutLikeForPost" (login, "userId", "addedAt","postId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams2 = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = true;
        }
        return this.postsRepository.likeOperation(update, updateParams, update2, updateParams2, doubleOperation);
    }
}
