import { Injectable } from "@nestjs/common";
import { CreatedPostDto } from "../dtos/posts.dto";
import { Posts } from "../schemas/posts.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class PostsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createPost(newPost: CreatedPostDto): Promise<Posts> {
        const query = `INSERT INTO posts (title, "shortDescription", content,
        "createdAt", "blogId", "postOwnerUserId","blogName")
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const values = [
            newPost.title,
            newPost.shortDescription,
            newPost.content,
            newPost.createdAt,
            newPost.blogId,
            newPost.postOwnerUserId,
            newPost.blogName,
        ];
        const result = await this.dataSource.query(query, values);
        const post = await this.dataSource.query(
            `SELECT p.*
             FROM posts p
             JOIN blogs b
             ON p."blogId" = b.id
             WHERE p.id = $1`,
            [result[0].id],
        );
        post[0].myStatus = "None";
        post[0].likesCount = 0;
        post[0].dislikesCount = 0;
        return post[0];
    }

    async updatePost(
        id: number,
        title: string,
        shortDescription: string,
        content: string,
        blogId: number,
    ): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE posts SET title = $1, "shortDescription" = $2,content = $3 WHERE id = $4 AND "blogId"=$5 RETURNING id`,
            [title, shortDescription, content, id, blogId],
        );
        return result[1] > 0;
    }

    async deletePostById(id: number): Promise<boolean> {
        await this.dataSource.query(`DELETE FROM "usersWhoPutDislikeForPost" WHERE "postId" =$1 `, [id]);
        await this.dataSource.query(`DELETE FROM "usersWhoPutLikeForPost" WHERE "postId" = $1 `, [id]);
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutDislikeForComment" 
        WHERE "commentId" IN (SELECT id FROM comments WHERE "postId" = $1)`,
            [id],
        );
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutLikeForComment" 
        WHERE "commentId" IN (SELECT id FROM comments WHERE "postId" = $1)`,
            [id],
        );
        await this.dataSource.query(`DELETE FROM comments WHERE "postId" = $1`, [id]);
        const result = await this.dataSource.query(`DELETE FROM posts WHERE id = $1 RETURNING id`, [id]);
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
