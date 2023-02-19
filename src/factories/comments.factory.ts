import {
    CommentViewModelClass,
    CommentViewModelForBloggerClass,
    CommentViewModelForBloggerPaginationClass,
    CommentViewModelPaginationClass,
} from "../entities/comments.entity";
import { CommentClassPaginationDto } from "../dtos/comments.dto";
import { Comments } from "../schemas/comments.schema";

export class CommentsFactory {
    static async createCommentViewModelClass(comment: Comments): Promise<CommentViewModelClass> {
        return new CommentViewModelClass(
            comment.id.toString(),
            comment.content,
            {
                userId: comment.commentOwnerUserId.toString(),
                userLogin: comment.commentOwnerUserLogin,
            },
            comment.createdAt,
            {
                likesCount: Number(comment.likesCount),
                dislikesCount: Number(comment.dislikesCount),
                myStatus: comment.myStatus,
            },
        );
    }

    static async createCommentViewModelForBloggerClass(comment: any): Promise<CommentViewModelForBloggerClass> {
        return new CommentViewModelForBloggerClass(
            comment.id.toString(),
            comment.content,
            comment.createdAt,
            {
                userId: comment.commentOwnerUserId.toString(),
                userLogin: comment.commentOwnerUserLogin,
            },
            {
                id: comment.postId.toString(),
                title: comment.title,
                blogId: comment.blogId.toString(),
                blogName: comment.blogName,
            },
            {
                likesCount: Number(comment.likesCount),
                dislikesCount: Number(comment.dislikesCount),
                myStatus: comment.myStatus,
            },
        );
    }

    static async createCommentViewModelClassPagination(
        dto: CommentClassPaginationDto,
    ): Promise<CommentViewModelPaginationClass> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return CommentsFactory.createCommentViewModelClass(elem);
            }),
        );
        return new CommentViewModelPaginationClass(dto.pagesCount, dto.page, dto.pageSize, dto.totalCount, result);
    }

    static async createCommentViewModelForBloggerPaginationClass(
        dto: CommentClassPaginationDto,
    ): Promise<CommentViewModelForBloggerPaginationClass> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return CommentsFactory.createCommentViewModelForBloggerClass(elem);
            }),
        );
        return new CommentViewModelForBloggerPaginationClass(
            dto.pagesCount,
            dto.page,
            dto.pageSize,
            dto.totalCount,
            result,
        );
    }
}
