import { Injectable } from "@nestjs/common";
import { BlogClassPaginationDto, ModelForGettingAllBlogs } from "../dtos/blogs.dto";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Blogs } from "../schemas/blogs.schema";
import { BlogViewModelClass } from "../entities/blogs.entity";

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

        const offset = pageSize * (pageNumber - 1);

        const queryBuilder = this.dataSource
            .createQueryBuilder()
            .select("blog")
            .from(Blogs, "blog")
            .where("blog.isBanned = :isBanned", { isBanned: false })
            .orderBy(`blog.${sortBy}`, sortDirection === "desc" ? "DESC" : "ASC")
            .offset(offset)
            .limit(pageSize);

        if (searchNameTerm) {
            queryBuilder.andWhere("blog.name ILIKE :name", { name: `%${searchNameTerm}%` });
        }

        const [cursor, totalCount] = await Promise.all([queryBuilder.getMany(), queryBuilder.getCount()]);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
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

        const offset = pageSize * (pageNumber - 1);

        const queryBuilder = this.dataSource
            .createQueryBuilder()
            .select("blog")
            .from(Blogs, "blog")
            .where("blog.isBanned = :isBanned", { isBanned: false })
            .andWhere("blog.blogOwnerUserId=:userId", { userId: userId })
            .orderBy(`blog.${sortBy}`, sortDirection === "desc" ? "DESC" : "ASC")
            .offset(offset)
            .limit(pageSize);

        if (searchNameTerm) {
            queryBuilder.andWhere("blog.name ILIKE :name", { name: `%${searchNameTerm}%` });
        }

        const [cursor, totalCount] = await Promise.all([queryBuilder.getMany(), queryBuilder.getCount()]);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
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

        const offset = pageSize * (pageNumber - 1);

        const queryBuilder = this.dataSource
            .createQueryBuilder()
            .select("blog")
            .from(Blogs, "blog")
            .orderBy(`blog.${sortBy}`, sortDirection === "desc" ? "DESC" : "ASC")
            .offset(offset)
            .limit(pageSize);

        if (searchNameTerm) {
            queryBuilder.where("blog.name ILIKE :name", { name: `%${searchNameTerm}%` });
        }

        const [cursor, totalCount] = await Promise.all([queryBuilder.getMany(), queryBuilder.getCount()]);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
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
        const blog = await this.dataSource
            .createQueryBuilder()
            .select("blog")
            .from(Blogs, "blog")
            .where("blog.id = :correctId", { correctId })
            .andWhere("blog.isBanned = :isBanned", { isBanned: false })
            .getOne();
        return blog || null;
    }

    async getBlogByIdForBanUnbanOperation(id: string): Promise<Blogs | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        const blog = await this.dataSource
            .createQueryBuilder()
            .select("blog")
            .from(Blogs, "blog")
            .where("blog.id = :correctId", { correctId })
            .getOne();
        return blog || null;
    }

    async getBlogByIdWithCorrectViewModel(id: string): Promise<BlogViewModelClass | null> {
        let correctId;
        if (id) {
            correctId = Number(id);
        }
        if (!Number.isInteger(correctId)) {
            return null;
        }
        const blog = await this.dataSource
            .getRepository(Blogs)
            .createQueryBuilder("blog")
            .select([
                "blog.id",
                "blog.name",
                "blog.description",
                "blog.websiteUrl",
                "blog.createdAt",
                "blog.isMembership",
            ])
            .where("blog.id = :id", { id: correctId })
            .getOne();
        if (blog) {
            const { id, ...rest } = blog;
            return { id: id.toString(), ...rest };
        } else {
            return null;
        }
    }

    async getBannedBlogsForUser(userId: number): Promise<BannedBlogs[] | null> {
        if (!Number.isInteger(userId)) {
            return null;
        }
        return await this.dataSource
            .createQueryBuilder()
            .select("bannedBlogs")
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :userId", { userId })
            .getRawMany();
    }
}
