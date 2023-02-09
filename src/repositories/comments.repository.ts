import { CommentsClass } from "../schemas/comments.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatedCommentDto } from "../dtos/comments.dto";

export class CommentsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createComment(newComment: CreatedCommentDto): Promise<CommentsClass> {
        const query = `INSERT INTO comments (content, "createdAt", "commentOwnerUserId", "postId", "commentOwnerUserLogin")
        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [
            newComment.content,
            newComment.createdAt,
            newComment.commentatorOwnerUserId,
            newComment.postId,
            newComment.commentatorOwnerUserLogin,
        ];
        const result = await this.dataSource.query(query, values);
        result[0].likesCount = 0;
        result[0].dislikesCount = 0;
        result[0].myStatus = "None";
        return result[0];
    }

    async deleteCommentById(id: number): Promise<boolean> {
        await this.dataSource.query(`DELETE FROM "usersWhoPutDislikeForComment" WHERE "commentId" =$1 `, [id]);
        await this.dataSource.query(`DELETE FROM "usersWhoPutLikeForComment" WHERE "commentId" = $1 `, [id]);
        const result = await this.dataSource.query(`DELETE FROM comments WHERE id = $1 RETURNING id`, [id]);
        return result[1] > 0;
    }

    async updateCommentById(id: number, content: string): Promise<boolean> {
        const result = await this.dataSource.query(`UPDATE comments SET content = $1 WHERE id = $2  RETURNING id`, [
            content,
            id,
        ]);
        return result[1] > 0;
    }

    async likeOperation(
        update: string,
        updateParams: string[],
        update2: string,
        updateParams2: string[],
        doubleOperation: boolean,
    ): Promise<boolean> {
        let result;
        if (doubleOperation) {
            await this.dataSource.query(update, updateParams);
            result = await this.dataSource.query(update2, updateParams2);
        } else {
            result = await this.dataSource.query(update, updateParams);
        }
        return result[1] > 0;
    }
}
