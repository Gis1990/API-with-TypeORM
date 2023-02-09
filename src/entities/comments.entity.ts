import { LikesInfoClass } from "../dtos/comments.dto";

export class CommentViewModelPaginationClass {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: CommentViewModelClass[],
    ) {}
}

export class CommentViewModelForBloggerPaginationClass {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: CommentViewModelForBloggerClass[],
    ) {}
}

export class CommentViewModelClass {
    constructor(
        public id: string,
        public content: string,
        public commentatorInfo: {
            userId: string;
            userLogin: string;
        },
        public createdAt: Date,
        public likesInfo: LikesInfoClass,
    ) {}
}

export class CommentViewModelForBloggerClass {
    constructor(
        public id: string,
        public content: string,
        public createdAt: Date,
        public commentatorInfo: {
            userId: string;
            userLogin: string;
        },
        public postInfo: {
            id: string;
            title: string;
            blogId: string;
            blogName: string;
        },
        public likesInfo: LikesInfoClass,
    ) {}
}
