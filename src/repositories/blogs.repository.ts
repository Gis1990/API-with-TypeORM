import { Injectable } from "@nestjs/common";
import { CreatedBlogDto, ForBanUnbanBlogBySuperAdminDto, InputModelForUpdatingBlog } from "../dtos/blogs.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Blogs } from "../schemas/blogs.schema";
import { Posts } from "../schemas/posts.schema";
import { UsersWhoPutDislikeForPost } from "../schemas/users.who.put.dislike.for.post.schema";
import { UsersWhoPutLikeForPost } from "../schemas/users.who.put.like.for.post.schema";
import { Comments } from "../schemas/comments.schema";

@Injectable()
export class BlogsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createBlog(newBlog: CreatedBlogDto): Promise<Blogs> {
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into("blogs")
            .values({
                name: newBlog.name,
                description: newBlog.description,
                websiteUrl: newBlog.websiteUrl,
                createdAt: newBlog.createdAt,
                isBanned: newBlog.isBanned,
                banDate: newBlog.banDate,
                blogOwnerUserId: newBlog.blogOwnerUserId,
                blogOwnerLogin: newBlog.blogOwnerLogin,
                isMembership: newBlog.isMembership,
            })
            .returning("*")
            .execute();
        return result.raw[0];
    }

    async updateBlog(blogId: number, dto: InputModelForUpdatingBlog): Promise<boolean> {
        const name = dto.name;
        const description = dto.description;
        const websiteUrl = dto.websiteUrl;
        const result = await this.dataSource
            .createQueryBuilder()
            .update("blogs")
            .set({ name: name, description: description, websiteUrl: websiteUrl })
            .where("id = :blogId", { blogId })
            .returning("id")
            .execute();

        return result.affected > 0;
    }

    async deleteBlogById(id: number): Promise<boolean> {
        const postsToDelete = await this.dataSource
            .createQueryBuilder()
            .select("post.id")
            .from(Posts, "post")
            .where("post.blogId = :id", { id })
            .getMany();
        const postIds = postsToDelete.map((post) => post.id);
        if (postIds.length > 0) {
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from(UsersWhoPutDislikeForPost)
                .where("postId IN (:...postIds)", { postIds })
                .execute();
            await this.dataSource
                .createQueryBuilder()
                .delete()
                .from(UsersWhoPutLikeForPost)
                .where("postId IN (:...postIds)", { postIds })
                .execute();
            const commentsToDelete = await this.dataSource
                .createQueryBuilder()
                .select("comment.id")
                .from(Comments, "comment")
                .where("comment.postId IN (:...postIds)", { postIds })
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
                await this.dataSource
                    .createQueryBuilder()
                    .delete()
                    .from(Comments)
                    .where("postId IN (:...postIds)", { postIds })
                    .execute();
            }
        }
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("posts")
            .where("blogId = :blogId", { blogId: id })
            .execute();
        const result = await this.dataSource
            .createQueryBuilder()
            .delete()
            .from("blogs")
            .where("id = :id", { id })
            .returning("id")
            .execute();
        return result.affected > 0;
    }

    async bindUserWithBlog(blogId: number, userId: number, login: string): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("blogs")
            .set({ blogOwnerUserId: userId, blogOwnerUserLogin: login })
            .where("id = :blogId", { blogId })
            .returning("id")
            .execute();
        return result.affected > 0;
    }

    async banUnbanBlogBySuperAdmin(
        dtoForBanUnbanBlogBySuperAdmin: ForBanUnbanBlogBySuperAdminDto,
        blogId: number,
    ): Promise<boolean> {
        const result = await this.dataSource
            .createQueryBuilder()
            .update("blogs")
            .set({
                isBanned: dtoForBanUnbanBlogBySuperAdmin.isBanned,
                banDate: dtoForBanUnbanBlogBySuperAdmin.banDate,
            })
            .where("id = :blogId", { blogId: blogId })
            .returning("id")
            .execute();
        return result.affected > 0;
    }
}
