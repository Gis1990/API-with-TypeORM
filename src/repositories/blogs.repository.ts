import { Injectable } from "@nestjs/common";
import { CreatedBlogDto, ForBanUnbanBlogBySuperAdminDto, InputModelForUpdatingBlog } from "../dtos/blogs.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "../schemas/blogs.schema";

@Injectable()
export class BlogsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createBlog(newBlog: CreatedBlogDto): Promise<BlogClass> {
        const query = `INSERT INTO blogs (name, description, "websiteUrl", "createdAt", "isBanned", "banDate", "blogOwnerUserId", "blogOwnerLogin", "isMembership") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
        const values = [
            newBlog.name,
            newBlog.description,
            newBlog.websiteUrl,
            newBlog.createdAt,
            newBlog.isBanned,
            newBlog.banDate,
            newBlog.blogOwnerUserId,
            newBlog.blogOwnerLogin,
            newBlog.isMembership,
        ];
        const result = await this.dataSource.query(query, values);
        return result[0];
    }

    async updateBlog(blogId: number, dto: InputModelForUpdatingBlog): Promise<boolean> {
        const name = dto.name;
        const description = dto.description;
        const websiteUrl = dto.websiteUrl;
        const result = await this.dataSource.query(
            `UPDATE blogs SET name = $1, description = $2,"websiteUrl" = $3 WHERE id = $4 RETURNING id`,
            [name, description, websiteUrl, blogId],
        );
        return result[1] > 0;
    }

    async deleteBlogById(id: number): Promise<boolean> {
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutDislikeForPost" WHERE "postId" IN (SELECT id FROM posts WHERE "blogId" = $1)`,
            [id],
        );
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutLikeForPost" WHERE "postId" IN (SELECT id FROM posts WHERE "blogId" = $1)`,
            [id],
        );
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutDislikeForComment" 
        WHERE "commentId" IN (SELECT id FROM comments WHERE "postId" IN (SELECT id FROM posts WHERE "blogId" = $1))`,
            [id],
        );
        await this.dataSource.query(
            `DELETE FROM "usersWhoPutLikeForComment" 
        WHERE "commentId" IN (SELECT id FROM comments WHERE "postId" IN (SELECT id FROM posts WHERE "blogId" = $1))`,
            [id],
        );
        await this.dataSource.query(
            `DELETE FROM comments WHERE "postId" IN (SELECT id FROM posts WHERE "blogId" = $1)`,
            [id],
        );
        await this.dataSource.query(`DELETE FROM posts WHERE "blogId" = $1`, [id]);
        const result = await this.dataSource.query(`DELETE FROM blogs WHERE id = $1 RETURNING id`, [id]);
        return result[1] > 0;
    }

    async bindUserWithBlog(blogId: number, userId: number, login: string): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE blogs SET "blogOwnerUserId" = $1 "blogOwnerUserLogin" = $2 WHERE id = $3 RETURNING id`,
            [userId, login, blogId],
        );
        return result[1] > 0;
    }

    async banUnbanBlogBySuperAdmin(
        dtoForBanUnbanBlogBySuperAdmin: ForBanUnbanBlogBySuperAdminDto,
        blogId: number,
    ): Promise<boolean> {
        const result = await this.dataSource.query(
            `UPDATE blogs SET "isBanned" = $1, "banDate" = $2 WHERE id = $3 RETURNING id`,
            [dtoForBanUnbanBlogBySuperAdmin.isBanned, dtoForBanUnbanBlogBySuperAdmin.banDate, blogId],
        );
        return result[1] > 0;
    }
}
