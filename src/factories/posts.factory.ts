import { PostsClass } from "../schemas/posts.schema";
import { PostViewModelClass, PostViewModelClassPagination } from "../entities/posts.entity";
import { PostClassPaginationDto } from "../dtos/posts.dto";

export class PostsFactory {
    static async createPostViewModelClass(post: PostsClass): Promise<PostViewModelClass> {
        let correctLikes = [];
        if (post.lastLikes) {
            correctLikes = post.lastLikes.map((elem: string) => {
                const [userId, login, date, time] = elem.split(" ");
                return { userId: userId, login, addedAt: `${date} ${time}` };
            });
        }
        return new PostViewModelClass(
            post.id.toString(),
            post.title,
            post.shortDescription,
            post.content,
            post.blogId.toString(),
            post.blogName,
            post.createdAt,
            {
                likesCount: Number(post.likesCount),
                dislikesCount: Number(post.dislikesCount),
                myStatus: post.myStatus,
                newestLikes: correctLikes,
            },
        );
    }

    static async createPostViewModelClassPagination(
        dto: PostClassPaginationDto,
    ): Promise<PostViewModelClassPagination> {
        const result = await Promise.all(
            dto.items.map((elem) => {
                return PostsFactory.createPostViewModelClass(elem);
            }),
        );
        return new PostViewModelClassPagination(dto.pagesCount, dto.page, dto.pageSize, dto.totalCount, result);
    }
}
