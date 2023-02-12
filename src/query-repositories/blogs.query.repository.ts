import { Injectable } from "@nestjs/common";
import { BlogClassPaginationDto, ModelForGettingAllBlogs } from "../dtos/blogs.dto";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Blogs } from "../schemas/blogs.schema";

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getAllBlogs(dto: ModelForGettingAllBlogs): Promise<BlogClassPaginationDto> {
        const {
            searchNameTerm = null,
            pageNumber = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortDirection = "desc",
        } = dto;
        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);
        const queryParamsForAllBlogs: any = [pageSize, offset];
        const queryParamsForCountAllBlogs: any = [];
        let whereClause = "";
        let whereClauseForCount = "";
        if (searchNameTerm) {
            whereClause += `AND name ILIKE $1 ORDER BY "${sortBy}"  ${sort} LIMIT $2 OFFSET $3`;
            queryParamsForAllBlogs.unshift(`%${searchNameTerm}%`);
            whereClauseForCount += `AND name ILIKE $1`;
            queryParamsForCountAllBlogs.push(`%${searchNameTerm}%`);
        } else {
            whereClause += `ORDER BY "${sortBy}"  ${sort} LIMIT $1 OFFSET $2`;
        }
        const query = `SELECT id,name,description,"websiteUrl", "createdAt","isMembership" FROM blogs WHERE "isBanned" = false ${whereClause}`;
        const cursor = await this.dataSource.query(query, queryParamsForAllBlogs);

        const totalCount = await this.dataSource.query(
            `SELECT COUNT(*) FROM blogs WHERE "isBanned" = false ${whereClauseForCount}`,
            queryParamsForCountAllBlogs,
        );
        return {
            pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount[0].count),
            items: cursor,
        };
    }

    async getAllBlogsForAuthorizedUser(dto: ModelForGettingAllBlogs, userId: number): Promise<BlogClassPaginationDto> {
        const {
            searchNameTerm = null,
            pageNumber = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortDirection = "desc",
        } = dto;
        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);
        const queryParamsForAllBlogsForAuthorizedUser: any = [userId, pageSize, offset];
        const queryParamsForCountAllBlogsForAuthorizedUser: any = [userId];
        let whereClause = "";
        let whereClauseForCount = "";
        if (searchNameTerm) {
            whereClause += `AND name ILIKE $2 ORDER BY "${sortBy}"  ${sort} LIMIT $3 OFFSET $4`;
            queryParamsForAllBlogsForAuthorizedUser.splice(1, 0, `%${searchNameTerm}%`);
            whereClauseForCount += `AND name ILIKE $2`;
            queryParamsForCountAllBlogsForAuthorizedUser.push(`%${searchNameTerm}%`);
        } else {
            whereClause += `ORDER BY "${sortBy}"  ${sort} LIMIT $2 OFFSET $3`;
        }
        const query = `SELECT id,name,description,"websiteUrl", "createdAt","isMembership" FROM blogs WHERE "isBanned" = false AND "blogOwnerUserId"=$1 ${whereClause}`;
        const cursor = await this.dataSource.query(query, queryParamsForAllBlogsForAuthorizedUser);
        const totalCount = await this.dataSource.query(
            `SELECT COUNT(*) FROM blogs WHERE "isBanned" = false AND "blogOwnerUserId"=$1 ${whereClauseForCount}`,
            queryParamsForCountAllBlogsForAuthorizedUser,
        );
        return {
            pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount[0].count),
            items: cursor,
        };
    }

    async getAllBlogsForSuperAdmin(dto: ModelForGettingAllBlogs): Promise<BlogClassPaginationDto> {
        const {
            searchNameTerm = null,
            pageNumber = 1,
            pageSize = 10,
            sortBy = "createdAt",
            sortDirection = "desc",
        } = dto;
        const sort = sortDirection === "desc" ? `DESC` : `ASC`;
        const offset = pageSize * (pageNumber - 1);
        const queryParamsForAllBlogsForSuperAdmin: any = [pageSize, offset];
        const queryParamsForCountAllBlogsForSuperAdmin = [];
        let whereClause = "";
        let whereClauseForCount = "";
        if (searchNameTerm) {
            whereClause += `WHERE name ILIKE $1 ORDER BY "${sortBy}"  ${sort} LIMIT $2 OFFSET $3`;
            queryParamsForAllBlogsForSuperAdmin.unshift(`%${searchNameTerm}%`);
            whereClauseForCount += `WHERE name ILIKE $1`;
            queryParamsForCountAllBlogsForSuperAdmin.push(`%${searchNameTerm}%`);
        } else {
            whereClause += `ORDER BY "${sortBy}"  ${sort} LIMIT $1 OFFSET $2`;
        }
        const query = `SELECT * FROM blogs ${whereClause}`;
        const cursor = await this.dataSource.query(query, queryParamsForAllBlogsForSuperAdmin);
        const totalCount = await this.dataSource.query(
            `SELECT COUNT(*) FROM blogs ${whereClauseForCount}`,
            queryParamsForCountAllBlogsForSuperAdmin,
        );
        return {
            pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: Number(totalCount[0].count),
            items: cursor,
        };
    }

    async getBlogById(id: string): Promise<Blogs | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        if (correctId >= 2147483647) {
            return null;
        }
        const result = await this.dataSource.query(`SELECT * FROM blogs WHERE id = $1 AND "isBanned" = false`, [
            correctId,
        ]);
        return result[0] || null;
    }

    async getBlogByIdForBanUnbanOperation(id: string): Promise<Blogs | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        const result = await this.dataSource.query(`SELECT * FROM blogs WHERE id = $1`, [correctId]);
        return result[0] || null;
    }

    async getBlogByIdWithCorrectViewModel(id: string): Promise<Blogs | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        const result = await this.dataSource.query(
            `SELECT id, name, description, "websiteUrl", "createdAt","isMembership" FROM blogs WHERE id= $1`,
            [correctId],
        );
        result[0].id = result[0].id.toString();
        return result[0] || null;
    }

    async getBannedBlogsForUser(userId: number): Promise<BannedBlogs | null> {
        if (!Number.isInteger(userId)) {
            return null;
        }
        const result = await this.dataSource.query(`SELECT * FROM "bannedBlogs" WHERE "userId" = $1`, [userId]);
        return result || null;
    }
}
