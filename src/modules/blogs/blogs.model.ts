import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

const pattern = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

@Entity("blogs")
@ObjectType()
export class BlogViewModelClass {
    @PrimaryGeneratedColumn()
    @Field({ nullable: false })
    id: string;

    @Column()
    @Field({ nullable: false })
    name: string;

    @Column()
    @Field({ nullable: false })
    description: string;

    @Column()
    @Field({ nullable: false })
    websiteUrl: string;

    @Column({ type: "timestamp" })
    @Field({ nullable: false })
    createdAt: Date;
}

@ObjectType()
export class BlogViewModelClassPagination {
    @Field(() => Int)
    pagesCount: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pageSize: number;

    @Field(() => Int)
    totalCount: number;

    @Field(() => [BlogViewModelClass])
    items: BlogViewModelClass[];
}

@InputType()
export class InputModelForCreatingBlogGQl {
    @Field()
    @IsString()
    @Length(1, 15)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public name: string;
    @Field()
    @IsString()
    @Length(1, 500)
    @IsNotEmpty()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    public description: string;
    @Field()
    @IsString()
    @Length(1, 100)
    @Matches(pattern)
    @IsNotEmpty()
    public websiteUrl: string;
}
