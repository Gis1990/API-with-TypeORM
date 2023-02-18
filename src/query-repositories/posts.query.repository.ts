import { Injectable } from "@nestjs/common";
import { Posts } from "../schemas/posts.schema";
import { ModelForGettingAllPosts, PostClassPaginationDto } from "../dtos/posts.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UsersWhoPutLikeForPost } from "../schemas/users.who.put.like.for.post.schema";
import { UsersWhoPutDislikeForPost } from "../schemas/users.who.put.dislike.for.post.schema";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Users } from "../schemas/users.schema";
import { Blogs } from "../schemas/blogs.schema";

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getAllPosts(dto: ModelForGettingAllPosts, userId: string | undefined): Promise<PostClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? "DESC" : "ASC";
        const offset = pageSize * (pageNumber - 1);

        const myStatusSubQueryPart1 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutLikeForPost, "ul")
            .where("ul.postId = posts.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutDislikeForPost, "ud")
            .where("ud.postId = posts.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });
        const queryBuilder = await this.dataSource
            .getRepository(Posts)
            .createQueryBuilder("posts")
            .select("posts.*")
            .innerJoin(Users, "users", "users.id = posts.postOwnerUserId")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForPost.id)", "likesCount")
                    .from(UsersWhoPutLikeForPost, "usersWhoPutLikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForPost.userId")
                    .where("usersWhoPutLikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForPost.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForPost, "usersWhoPutDislikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForPost.userId")
                    .where("usersWhoPutDislikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "dislikesCount")
            .addSelect(
                `CASE
            WHEN (${myStatusSubQueryPart1.getQuery()}) IS NOT NULL THEN 'Like'
            WHEN (${myStatusSubQueryPart2.getQuery()}) IS NOT NULL THEN 'Dislike'
            ELSE 'None'
            END AS "myStatus"`,
            )
            .addSelect((subQuery) => {
                return subQuery.select("array_agg(likes)", "lastLikes").from((subQuery) => {
                    return subQuery
                        .select(
                            `"usersWhoPutLikeForPost"."userId" || ' ' || "usersWhoPutLikeForPost".login || ' ' || "usersWhoPutLikeForPost"."addedAt"`,
                            "likes",
                        )
                        .from("usersWhoPutLikeForPost", "usersWhoPutLikeForPost")
                        .innerJoin("users", "users", 'users.id = "usersWhoPutLikeForPost"."userId"')
                        .where("usersWhoPutLikeForPost.postId = posts.id")
                        .andWhere("users.isBanned = false")
                        .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                        .orderBy('"addedAt"', "DESC")
                        .limit(3);
                }, "subquery");
            }, "lastLikes")
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy("posts.id")
            .orderBy(`posts.${sortBy}`, sort)
            .limit(pageSize)
            .offset(offset);
        const [cursor, totalCount] = await Promise.all([queryBuilder.getRawMany(), queryBuilder.getCount()]);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: cursor,
        };
    }

    async getAllPostsForSpecificBlog(
        dto: ModelForGettingAllPosts,
        blogId: number,
        userId: number | undefined,
    ): Promise<PostClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? "DESC" : "ASC";
        const offset = pageSize * (pageNumber - 1);

        const myStatusSubQueryPart1 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutLikeForPost, "ul")
            .where("ul.postId = posts.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutDislikeForPost, "ud")
            .where("ud.postId = posts.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });
        const queryBuilder = await this.dataSource
            .getRepository(Posts)
            .createQueryBuilder("posts")
            .select("posts.*")
            .innerJoin(Users, "users", "users.id = posts.postOwnerUserId")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForPost.id)", "likesCount")
                    .from(UsersWhoPutLikeForPost, "usersWhoPutLikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForPost.userId")
                    .where("usersWhoPutLikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForPost.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForPost, "usersWhoPutDislikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForPost.userId")
                    .where("usersWhoPutDislikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "dislikesCount")
            .addSelect(
                `CASE
            WHEN (${myStatusSubQueryPart1.getQuery()}) IS NOT NULL THEN 'Like'
            WHEN (${myStatusSubQueryPart2.getQuery()}) IS NOT NULL THEN 'Dislike'
            ELSE 'None'
            END AS "myStatus"`,
            )
            .addSelect((subQuery) => {
                return subQuery.select("array_agg(likes)", "lastLikes").from((subQuery) => {
                    return subQuery
                        .select(
                            `"usersWhoPutLikeForPost"."userId" || ' ' || "usersWhoPutLikeForPost".login || ' ' || "usersWhoPutLikeForPost"."addedAt"`,
                            "likes",
                        )
                        .from("usersWhoPutLikeForPost", "usersWhoPutLikeForPost")
                        .innerJoin("users", "users", 'users.id = "usersWhoPutLikeForPost"."userId"')
                        .where("usersWhoPutLikeForPost.postId = posts.id")
                        .andWhere("users.isBanned = false")
                        .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                        .orderBy('"addedAt"', "DESC")
                        .limit(3);
                }, "subquery");
            }, "lastLikes")
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("posts.blogId = :blogId", { blogId })
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy("posts.id")
            .orderBy(`posts.${sortBy}`, sort)
            .limit(pageSize)
            .offset(offset);
        const [cursor, totalCount] = await Promise.all([queryBuilder.getRawMany(), queryBuilder.getCount()]);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: cursor,
        };
    }

    async getPostById(id: string, userId: number | undefined): Promise<Posts | null> {
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
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const myStatusSubQueryPart1 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutLikeForPost, "ul")
            .where("ul.postId = posts.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"postId"`)
            .from(UsersWhoPutDislikeForPost, "ud")
            .where("ud.postId = posts.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });
        const post = await this.dataSource
            .getRepository(Posts)
            .createQueryBuilder("posts")
            .select("posts.*")
            .innerJoin(Users, "users", "users.id = posts.postOwnerUserId")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForPost.id)", "likesCount")
                    .from(UsersWhoPutLikeForPost, "usersWhoPutLikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForPost.userId")
                    .where("usersWhoPutLikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForPost.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForPost, "usersWhoPutDislikeForPost")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForPost.userId")
                    .where("usersWhoPutDislikeForPost.postId = posts.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "dislikesCount")
            .addSelect(
                `CASE
            WHEN (${myStatusSubQueryPart1.getQuery()}) IS NOT NULL THEN 'Like'
            WHEN (${myStatusSubQueryPart2.getQuery()}) IS NOT NULL THEN 'Dislike'
            ELSE 'None'
            END AS "myStatus"`,
            )
            .addSelect((subQuery) => {
                return subQuery.select("array_agg(likes)", "lastLikes").from((subQuery) => {
                    return subQuery
                        .select(
                            `"usersWhoPutLikeForPost"."userId" || ' ' || "usersWhoPutLikeForPost".login || ' ' || "usersWhoPutLikeForPost"."addedAt"`,
                            "likes",
                        )
                        .from("usersWhoPutLikeForPost", "usersWhoPutLikeForPost")
                        .innerJoin("users", "users", 'users.id = "usersWhoPutLikeForPost"."userId"')
                        .where("usersWhoPutLikeForPost.postId = posts.id")
                        .andWhere("users.isBanned = false")
                        .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                        .orderBy('"addedAt"', "DESC")
                        .limit(3);
                }, "subquery");
            }, "lastLikes")
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("posts.id = :correctId", { correctId })
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy("posts.id")
            .getRawOne();
        return post || null;
    }

    async getPostByIdForOperationWithLikes(id: number): Promise<Posts | null> {
        const post = await this.dataSource
            .createQueryBuilder()
            .select("post")
            .from(Posts, "post")
            .where("post.id = :id ", { id })
            .getOne();
        if (!post) {
            return null;
        } else {
            post.likesArray = await this.dataSource
                .createQueryBuilder()
                .select("p")
                .from(UsersWhoPutLikeForPost, "p")
                .where("p.postId = :id ", { id })
                .getMany();
            post.dislikesArray = await this.dataSource
                .createQueryBuilder()
                .select("p")
                .from(UsersWhoPutDislikeForPost, "p")
                .where("p.postId = :id ", { id })
                .getMany();
            return post;
        }
    }
}
