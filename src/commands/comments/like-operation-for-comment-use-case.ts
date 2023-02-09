import { CommentsRepository } from "../../repositories/comments.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { GetCommentByIdForLikeOperationCommand } from "../../queries/comments/get-comment-by-id-for-like-operation-query";

export class LikeOperationForCommentCommand {
    constructor(
        public readonly id: string,
        public readonly userId: number,
        public readonly login: string,
        public readonly likeStatus: string,
    ) {}
}

@CommandHandler(LikeOperationForCommentCommand)
export class LikeOperationForCommentUseCase implements ICommandHandler<LikeOperationForCommentCommand> {
    constructor(private commentsRepository: CommentsRepository, private queryBus: QueryBus) {}

    async execute(command: LikeOperationForCommentCommand): Promise<boolean> {
        const comment = await this.queryBus.execute(new GetCommentByIdForLikeOperationCommand(command.id));
        if (!comment) {
            return false;
        }
        const isLiked = comment.likesArray.map((user) => user.userId).includes(command.userId);
        const isDisliked = comment.dislikesArray.map((user) => user.userId).includes(command.userId);
        let updateParams;
        let updateParams2;
        let update;
        let update2;
        let doubleOperation;
        // If the user wants to like the comment and has not already liked or disliked it,
        // Add the user to the list of users who liked the comment
        if (command.likeStatus === "Like" && !isLiked && !isDisliked) {
            update = `INSERT INTO "usersWhoPutLikeForComment" (login, "userId", "addedAt","commentId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = false;
        }
        // If the user wants to dislike the comment and has not already liked or disliked it,
        // Add the user to the list of users who disliked the comment
        else if (command.likeStatus === "Dislike" && !isDisliked && !isLiked) {
            update = `INSERT INTO "usersWhoPutDislikeForComment" (login, "userId", "addedAt","commentId")
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
        // If the user wants to change his status to None and has already liked the comment,
        // Remove the user from the list of users who liked the comment,
        else if (command.likeStatus === "None" && isLiked) {
            update = `DELETE FROM "usersWhoPutLikeForComment" WHERE "commentId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [Number(command.id), command.userId];
            doubleOperation = false;
        }
        // If the user wants to change his status to None and has already disliked the comment,
        // Remove the user from the list of users who disliked the comment,
        else if (command.likeStatus === "None" && isDisliked) {
            update = `DELETE FROM "usersWhoPutDislikeForComment" WHERE "commentId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [Number(command.id), command.userId];
            doubleOperation = false;
        }
        // If the user has already liked the comment and wants to dislike it,
        // Remove the user from the list of users who liked the comment, and add them to the list of users who disliked the comment
        else if (isLiked && command.likeStatus === "Dislike") {
            update = `DELETE FROM "usersWhoPutLikeForComment" WHERE "commentId" =$1 AND "userId" = $2`;
            updateParams = [command.id, command.userId];
            update2 = `INSERT INTO "usersWhoPutDislikeForComment" (login, "userId", "addedAt","commentId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams2 = [command.login, command.userId, new Date(), Number(command.id)];
            doubleOperation = true;
        }

        // If the user has already disliked the comment and wants to like it,
        // Remove the user from the list of users who disliked the comment, and add them to the list of users who liked the comment
        else if (isDisliked && command.likeStatus === "Like") {
            update = `DELETE FROM "usersWhoPutDislikeForComment" WHERE "commentId" =$1 AND "userId" = $2 RETURNING id`;
            updateParams = [Number(command.id), command.userId];
            update = `INSERT INTO "usersWhoPutLikeForComment" (login, "userId", "addedAt","commentId")
        VALUES ($1, $2, $3,$4) RETURNING id`;
            updateParams = [command.login, command.userId, new Date(), command.id];
            doubleOperation = true;
        }

        return this.commentsRepository.likeOperation(update, updateParams, update2, updateParams2, doubleOperation);
    }
}
