import { IsString, Length, Matches, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsIn } from "class-validator";
import { IsEmailExist, IsLoginExist, IsUsersIdExist } from "../decorators/users/users.custom.decorators";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsBlogsIdExistInTheRequestBody } from "../decorators/blogs/blogs.custom.decorators";
import { Users } from "../schemas/users.schema";

const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const listOfCorrectBanStatus = ["all", "banned", "notBanned"];

export class ModelForGettingAllUsers {
    @IsString()
    @IsNotEmpty()
    @IsIn(listOfCorrectBanStatus)
    @IsOptional()
    public banStatus: string;
    @IsString()
    @IsOptional()
    public searchLoginTerm: string;
    @IsString()
    @IsOptional()
    public searchEmailTerm: string;
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

export class InputModelForCreatingNewUser {
    @IsString()
    @IsNotEmpty()
    @Length(3, 10)
    @IsLoginExist({
        message: "Login is already exist",
    })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public login: string;
    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public password: string;
    @IsString()
    @Matches(pattern)
    @IsEmailExist({
        message: "Email is already exist",
    })
    public email: string;
}

export class InputModelForBanUnbanUser {
    @IsBoolean()
    @IsNotEmpty()
    public isBanned: boolean;
    @IsNotEmpty()
    @IsString()
    @Length(20)
    public banReason: string;
}

export class InputModelForBanUnbanUserByBloggerForBlog extends InputModelForBanUnbanUser {
    @IsNotEmpty()
    @IsString()
    @IsBlogsIdExistInTheRequestBody({
        message: "BlogsId is not exist",
    })
    public blogId: string;
}

export class UsersIdValidationModel {
    @IsString()
    @IsNotEmpty()
    @IsUsersIdExist()
    public id: string;
}

export class ModelForGettingAllBannedUsersForBlog {
    @IsString()
    @IsOptional()
    public searchLoginTerm: string;
    @IsString()
    @IsOptional()
    public sortBy: string;
    @IsString()
    @IsOptional()
    public sortDirection: string;
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    public pageNumber: number;
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    public pageSize: number;
}

export class CreatedNewUserDto {
    public login: string;
    public email: string;
    public passwordHash: string;
    public createdAt: Date;
    public emailConfirmed: boolean;
    public emailConfirmationCode: string;
    public emailExpirationDate: Date;
    public emailRecoveryCode: string | null;
    public emailRecoveryExpirationDate: Date | null;
    public isBanned: boolean;
    public banDate: Date | null;
    public banReason: string | null;
    public currentSessionLastActiveDate: string | null;
    public currentSessionDeviceId: string | null;
    public currentSessionIp: string | null;
    public currentSessionTitle: string | null;
    public sentEmails: [];
}

export class BanInfoClass {
    public isBanned: boolean;
    public banDate: Date;
    public banReason: string;
}

export class UsersClassPaginationDto {
    public pagesCount: number;
    public page: number;
    public pageSize: number;
    public totalCount: number;
    public items: Users[];
}

export class UserModelClass {
    public id: string;
    public login: string;
    public email: string;
    public currentSession: any;
    public banInfo: any;
    public userDevicesData: any;
}
