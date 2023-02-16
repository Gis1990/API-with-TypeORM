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
        const addedAt = new Date();
        let table1;
        let table2;
        let doubleOperation;
        // If the user wants to like the comment and has not already liked or disliked it,
        // Add the user to the list of users who liked the comment
        if (command.likeStatus === "Like" && !isLiked && !isDisliked) {
            table1 = "usersWhoPutLikeForComment";
            doubleOperation = false;
        }
        // If the user wants to dislike the comment and has not already liked or disliked it,
        // Add the user to the list of users who disliked the comment
        else if (command.likeStatus === "Dislike" && !isDisliked && !isLiked) {
            table1 = "usersWhoPutDislikeForComment";
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
            table1 = "usersWhoPutLikeForComment";
            doubleOperation = false;
        }
        // If the user wants to change his status to None and has already disliked the comment,
        // Remove the user from the list of users who disliked the comment,
        else if (command.likeStatus === "None" && isDisliked) {
            table1 = "usersWhoPutDislikeForComment";
            doubleOperation = false;
        }
        // If the user has already liked the comment and wants to dislike it,
        // Remove the user from the list of users who liked the comment, and add them to the list of users who disliked the comment
        else if (isLiked && command.likeStatus === "Dislike") {
            table1 = "usersWhoPutLikeForComment";
            table2 = "usersWhoPutDislikeForComment";
            doubleOperation = true;
        }

        // If the user has already disliked the comment and wants to like it,
        // Remove the user from the list of users who disliked the comment, and add them to the list of users who liked the comment
        else if (isDisliked && command.likeStatus === "Like") {
            table1 = "usersWhoPutDislikeForComment";
            table2 = "usersWhoPutLikeForComment";
            doubleOperation = true;
        }

        return this.commentsRepository.likeOperation(
            table1,
            table2,
            Number(command.id),
            command.userId,
            command.login,
            addedAt,
            command.likeStatus,
            doubleOperation,
        );
    }
}
