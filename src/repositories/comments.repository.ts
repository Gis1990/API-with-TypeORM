import { Comments } from "../schemas/comments.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatedCommentDto } from "../dtos/comments.dto";

export class CommentsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createComment(newComment: CreatedCommentDto): Promise<Comments> {
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("comments")
            .values({
                content: newComment.content,
                createdAt: newComment.createdAt,
                commentOwnerUserId: newComment.commentatorOwnerUserId,
                postId: newComment.postId,
                commentOwnerUserLogin: newComment.commentatorOwnerUserLogin,
                likesCount: newComment.likesCount,
                dislikesCount: newComment.dislikesCount,
                myStatus: newComment.myStatus,
            })
            .returning("*")
            .execute();
        return result.raw[0];
    }

    async deleteCommentById(id: number): Promise<boolean> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("usersWhoPutDislikeForComment")
            .where("id = :id", { id })
            .returning("id")
            .execute();
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("usersWhoPutLikeForComment")
            .where("id = :id", { id })
            .returning("id")
            .execute();
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("comments")
            .where("id = :id", { id })
            .returning("id")
            .execute();
        return result[1] > 0;
    }

    async updateCommentById(id: number, content: string): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("comments")
            .set({ content: content })
            .where("id = :id", { id })
            .returning("id")
            .execute();
        return result.affected > 0;
    }

    async likeOperation(
        table1: string,
        table2: string | undefined,
        postId: number,
        userId: number,
        login: string,
        addedAt: Date,
        likeStatus: string,
        doubleOperation: boolean,
    ): Promise<boolean> {
        let result;
        if (doubleOperation) {
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from(`${table1}`)
                .where("postId = :postId", { postId })
                .andWhere("userId = :userId", { userId })
                .execute();
            result = await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(`${table2}`)
                .values([{ login, userId, addedAt, postId }])
                .execute();
        } else {
            if (likeStatus !== "None") {
                result = await this.dataSource
                    .createQueryBuilder()
                    .insert()
                    .into(`${table1}`)
                    .values([{ login, userId, addedAt, postId }])
                    .execute();
            } else {
                result = await this.dataSource
                    .createQueryBuilder()
                    .delete()
                    .from(`${table1}`)
                    .where("postId = :postId", { postId })
                    .andWhere("userId = :userId", { userId })
                    .execute();
            }
        }
        return result.affected > 0;
    }
}
