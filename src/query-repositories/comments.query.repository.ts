import { Comments } from "../schemas/comments.schema";
import { CommentClassPaginationDto, ModelForGettingAllComments } from "../dtos/comments.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UsersWhoPutLikeForComment } from "../schemas/users.who.put.like.for.comment.schema";
import { UsersWhoPutDislikeForComment } from "../schemas/users.who.put.dislike.for.comment.schema";
import { Users } from "../schemas/users.schema";
import { BannedBlogs } from "../schemas/banned.blogs.schema";
import { Blogs } from "../schemas/blogs.schema";
import { Posts } from "../schemas/posts.schema";

export class CommentsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getCommentById(id: string, userId: number | undefined): Promise<Comments | null> {
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
            .select(`"commentId"`)
            .from(UsersWhoPutLikeForComment, "ul")
            .where("ul.commentId = comments.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"commentId"`)
            .from(UsersWhoPutDislikeForComment, "ud")
            .where("ud.commentId = comments.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });
        const comment = await this.dataSource
            .getRepository(Comments)
            .createQueryBuilder("comments")
            .select("comments.*, posts.title, posts.blogId, blogs.name as blogName")
            .innerJoin(Users, "users", "users.id = comments.commentOwnerUserId")
            .innerJoin(Posts, "posts", "comments.postId = posts.id")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForComment.id)", "likesCount")
                    .from(UsersWhoPutLikeForComment, "usersWhoPutLikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForComment.userId")
                    .where("usersWhoPutLikeForComment.commentId = comments.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForComment.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForComment, "usersWhoPutDislikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForComment.userId")
                    .where("usersWhoPutDislikeForComment.commentId = comments.id")
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
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("comments.id = :correctId", { correctId })
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy(
                "comments.id, comments.content, comments.createdAt, comments.commentOwnerUserId, comments.postId, comments.commentOwnerUserLogin, posts.title, posts.blogId, blogs.name",
            )
            .getRawOne();
        return comment || null;
    }

    async getAllCommentsForSpecificPost(
        dto: ModelForGettingAllComments,
        postId: number,
        userId: number | undefined,
    ): Promise<CommentClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? "DESC" : "ASC";
        const offset = pageSize * (pageNumber - 1);

        const myStatusSubQueryPart1 = this.dataSource
            .createQueryBuilder()
            .select(`"commentId"`)
            .from(UsersWhoPutLikeForComment, "ul")
            .where("ul.commentId = comments.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"commentId"`)
            .from(UsersWhoPutDislikeForComment, "ud")
            .where("ud.commentId = comments.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });

        const queryBuilder = await this.dataSource
            .getRepository(Comments)
            .createQueryBuilder("comments")
            .select("comments.*, posts.title, posts.blogId, blogs.name as blogName")
            .innerJoin(Users, "users", "users.id = comments.commentOwnerUserId")
            .innerJoin(Posts, "posts", "comments.postId = posts.id")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForComment.id)", "likesCount")
                    .from(UsersWhoPutLikeForComment, "usersWhoPutLikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForComment.userId")
                    .where("usersWhoPutLikeForComment.commentId = comments.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForComment.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForComment, "usersWhoPutDislikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForComment.userId")
                    .where("usersWhoPutDislikeForComment.commentId = comments.id")
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
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("comments.postId = :postId", { postId })
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy(
                "comments.id, comments.content, comments.createdAt, comments.commentOwnerUserId, comments.postId, comments.commentOwnerUserLogin, posts.title, posts.blogId, blogs.name",
            )
            .orderBy(`comments.${sortBy}`, sort)
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

    async getAllCommentsForAllPostsForBloggersBlogs(
        dto: ModelForGettingAllComments,
        userId: number | undefined,
    ): Promise<CommentClassPaginationDto> {
        const correctUserId = Number.isInteger(Number(userId)) ? Number(userId) : 0;
        const { pageNumber = 1, pageSize = 10, sortBy = "createdAt", sortDirection = "desc" } = dto;
        const sort = sortDirection === "desc" ? "DESC" : "ASC";
        const offset = pageSize * (pageNumber - 1);

        const myStatusSubQueryPart1 = this.dataSource
            .createQueryBuilder()
            .select(`"commentId"`)
            .from(UsersWhoPutLikeForComment, "ul")
            .where("ul.commentId = comments.id")
            .andWhere("ul.userId = :correctUserId", { correctUserId });
        const myStatusSubQueryPart2 = this.dataSource
            .createQueryBuilder()
            .select(`"commentId"`)
            .from(UsersWhoPutDislikeForComment, "ud")
            .where("ud.commentId = comments.id")
            .andWhere("ud.userId = :correctUserId", { correctUserId });
        const userQb = await this.dataSource
            .createQueryBuilder()
            .select('"userId"')
            .from(BannedBlogs, "bannedBlogs")
            .where("bannedBlogs.userId = :correctUserId", { correctUserId });

        const queryBuilder = await this.dataSource
            .getRepository(Comments)
            .createQueryBuilder("comments")
            .select(`comments.*, posts.title, posts.blogId, blogs.name as "blogName"`)
            .innerJoin(Users, "users", "users.id = comments.commentOwnerUserId")
            .innerJoin(Posts, "posts", "comments.postId = posts.id")
            .innerJoin(Blogs, "blogs", "blogs.id = posts.blogId")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutLikeForComment.id)", "likesCount")
                    .from(UsersWhoPutLikeForComment, "usersWhoPutLikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutLikeForComment.userId")
                    .where("usersWhoPutLikeForComment.commentId = comments.id")
                    .andWhere("users.isBanned = false")
                    .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
                    .setParameters(userQb.getParameters());
            }, "likesCount")
            .addSelect((subQuery) => {
                return subQuery
                    .select("COUNT(DISTINCT usersWhoPutDislikeForComment.id)", "dislikesCount")
                    .from(UsersWhoPutDislikeForComment, "usersWhoPutDislikeForComment")
                    .innerJoin(Users, "users", "users.id = usersWhoPutDislikeForComment.userId")
                    .where("usersWhoPutDislikeForComment.commentId = comments.id")
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
            .where("users.isBanned = false")
            .andWhere("blogs.isBanned = false")
            .andWhere("blogs.blogOwnerUserId = :correctUserId", { correctUserId })
            .andWhere("users.id NOT IN (" + userQb.getQuery() + ")")
            .setParameters(userQb.getParameters())
            .groupBy(
                "comments.id, comments.content, comments.createdAt, comments.commentOwnerUserId, comments.postId, comments.commentOwnerUserLogin, posts.title, posts.blogId, blogs.name",
            )
            .orderBy(`comments.${sortBy}`, sort)
            .limit(pageSize)
            .offset(offset);
        const [cursor, totalCount] = await Promise.all([queryBuilder.getRawMany(), queryBuilder.getCount()]);
        console.log("cursor", cursor);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: cursor,
        };
    }

    async getCommentByIdForLikeOperation(id: number): Promise<Comments> {
        const comment = await this.dataSource
            .createQueryBuilder()
            .select("comment")
            .from(Comments, "comment")
            .where("comment.id = :id ", { id })
            .getOne();
        if (!comment) {
            return null;
        } else {
            comment.likesArray = await this.dataSource
                .createQueryBuilder()
                .select("c")
                .from(UsersWhoPutLikeForComment, "c")
                .where("c.id = :id ", { id })
                .getMany();
            comment.dislikesArray = await this.dataSource
                .createQueryBuilder()
                .select("c")
                .from(UsersWhoPutDislikeForComment, "c")
                .where("c.id = :id ", { id })
                .getMany();
            return comment;
        }
    }
}
