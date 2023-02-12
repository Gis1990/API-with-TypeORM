import {
    BlogViewModelClass,
    BlogViewModelClassPagination,
    BlogViewModelForSaClass,
    BlogViewModelForSaPaginationClass,
} from "../entities/blogs.entity";
import { Blogs } from "../schemas/blogs.schema";
import { BlogClassPaginationDto } from "../dtos/blogs.dto";

export class BlogsFactory {
    static async createBlogViewModelClass(blog: Blogs): Promise<BlogViewModelClass> {
        return new BlogViewModelClass(
            blog.id.toString(),
            blog.name,
            blog.description,
            blog.websiteUrl,
            blog.createdAt,
            blog.isMembership,
        );
    }

    static async createBlogViewModelPaginationClass(
        dto: BlogClassPaginationDto,
    ): Promise<BlogViewModelClassPagination> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return BlogsFactory.createBlogViewModelClass(elem);
            }),
        );
        return new BlogViewModelClassPagination(dto.pagesCount, dto.page, dto.pageSize, dto.totalCount, result);
    }

    static async createBlogViewModelForSaClass(blog: Blogs): Promise<BlogViewModelForSaClass> {
        return new BlogViewModelForSaClass(
            blog.id.toString(),
            blog.name,
            blog.description,
            blog.websiteUrl,
            blog.createdAt,
            {
                userId: blog.blogOwnerUserId.toString(),
                userLogin: blog.blogOwnerLogin,
            },
            {
                isBanned: blog.isBanned,
                banDate: blog.banDate,
            },
            blog.isMembership,
        );
    }

    static async createBlogViewModelForSaPaginationClass(
        dto: BlogClassPaginationDto,
    ): Promise<BlogViewModelForSaPaginationClass> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return BlogsFactory.createBlogViewModelForSaClass(elem);
            }),
        );
        return new BlogViewModelForSaPaginationClass(dto.pagesCount, dto.page, dto.pageSize, dto.totalCount, result);
    }
}
