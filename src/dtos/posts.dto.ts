import { IsBlogsIdExistInTheRequestBody } from "../decorators/blogs/blogs.custom.decorators";
import { IsString, Length, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsPostIdExist } from "../decorators/posts/posts.custom.decorators";
import { Posts } from "../schemas/posts.schema";

export class ModelForGettingAllPosts {
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

export class InputModelForCreatingAndUpdatingNewPostForSpecificBlog {
    @IsString()
    @Length(1, 30)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public title: string;
    @IsString()
    @Length(1, 100)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public shortDescription: string;
    @IsString()
    @Length(1, 1000)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public content: string;
}

export class InputModelForCreatingAndUpdatingPost {
    @IsString()
    @Length(1, 30)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public title: string;
    @IsString()
    @Length(1, 100)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public shortDescription: string;
    @IsString()
    @Length(1, 1000)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public content: string;
    @IsString()
    @IsNotEmpty()
    @IsBlogsIdExistInTheRequestBody({
        message: "BlogsId is not exist",
    })
    public blogId: string;
}

export class PostsIdValidationModel {
    @IsString()
    @IsNotEmpty()
    @IsPostIdExist()
    public postId: string;
}

export class CreatedPostDto {
    public title: string;
    public shortDescription: string;
    public content: string;
    public createdAt: Date;
    public blogId: number;
    public postOwnerUserId: number;
    public blogName: string;
    public likesCount: number;
    public dislikesCount: number;
    public myStatus: string;
}

export class PostClassPaginationDto {
    public pagesCount: number;
    public page: number;
    public pageSize: number;
    public totalCount: number;
    public items: Posts[];
}

export class ExtendedLikesInfoClass {
    public likesCount: number;
    public dislikesCount: number;
    public myStatus: string;
    public newestLikes: { addedAt: Date; userId: string; login: string }[];
}
