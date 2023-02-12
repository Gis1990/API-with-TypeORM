import { IsString, Length, IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsCommentsIdExist } from "../decorators/comments/comments.custom.decorators";
import { Comments } from "../schemas/comments.schema";

const listOfCorrectLikeStatus = ["Like", "Dislike", "None"];

export class ModelForGettingAllComments {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    public pageNumber: number;
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    public pageSize: number;
    @IsString()
    @IsOptional()
    public sortBy: string;
    @IsString()
    @IsOptional()
    public sortDirection: string;
}

export class ModelForUpdatingComment {
    @IsString()
    @Length(20, 300)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public content: string;
}

export class CommentsIdValidationModel {
    @IsString()
    @IsNotEmpty()
    @IsCommentsIdExist()
    public id: string;
}

export class ModelForLikeStatus {
    @IsString()
    @IsNotEmpty()
    @IsIn(listOfCorrectLikeStatus)
    public likeStatus: string;
}

export class ModelForCreatingNewComment {
    @IsString()
    @Length(20, 300)
    @IsNotEmpty()
    public content: string;
}

export class CreatedCommentDto {
    public content: string;
    public createdAt: Date;
    public commentatorOwnerUserId: number;
    public commentatorOwnerUserLogin: string;
    public postId: number;
}

export class CommentClassPaginationDto {
    public pagesCount: number;
    public page: number;
    public pageSize: number;
    public totalCount: number;
    public items: Comments[];
}

export class LikesInfoClass {
    public likesCount: number;
    public dislikesCount: number;
    public myStatus: string;
}
