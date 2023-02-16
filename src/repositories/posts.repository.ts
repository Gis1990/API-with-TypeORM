import { Injectable } from "@nestjs/common";
import { CreatedPostDto } from "../dtos/posts.dto";
import { Posts } from "../schemas/posts.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Comments } from "../schemas/comments.schema";

@Injectable()
export class PostsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createPost(newPost: CreatedPostDto): Promise<Posts> {
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("posts")
            .values({
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                createdAt: newPost.createdAt,
                blogId: newPost.blogId,
                postOwnerUserId: newPost.postOwnerUserId,
                blogName: newPost.blogName,
                likesCount: newPost.likesCount,
                dislikesCount: newPost.dislikesCount,
                myStatus: newPost.myStatus,
            })
            .returning("*")
            .execute();
        return result.raw[0];
    }

    async updatePost(
        id: number,
        title: string,
        shortDescription: string,
        content: string,
        blogId: number,
    ): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("posts")
            .set({
                title: title,
                shortDescription: shortDescription,
                content: content,
            })
            .where("id = :id AND blogId = :blogId", { id: id, blogId: blogId })
            .returning("id")
            .execute();
        return result.affected > 0;
    }

    async deletePostById(id: number): Promise<boolean> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("usersWhoPutDislikeForPost")
            .where("postId = :id", { id: id })
            .execute();
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("usersWhoPutLikeForPost")
            .where("postId = :id", { id: id })
            .execute();
        const commentsToDelete = await this.dataSource
            .createQueryBuilder()
            .select("comment.id")
            .from(Comments, "comment")
            .where("comment.postId=:id", { id })
            .getMany();
        const commentIds = commentsToDelete.map((comment) => comment.id);
        if (commentIds.length > 0) {
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from("usersWhoPutDislikeForComment")
                .where("commentId IN (:...commentIds)", { commentIds })
                .execute();
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from("usersWhoPutLikeForComment")
                .where("commentId IN (:...commentIds)", { commentIds })
                .execute();
        }
        await this.dataSource.createQueryBuilder().delete().from("comments").where("postId = :id", { id }).execute();
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("posts")
            .where("id = :id", { id })
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
