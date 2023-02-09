import { BanInfoClass } from "../dtos/users.dto";

export class UserViewModelClassPagination {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: UserViewModelClass[],
    ) {}
}

export class UserViewModelForBannedUsersByBloggerPaginationClass {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: UserViewModelForBannedUsersByBloggerClass[],
    ) {}
}

export class UserViewModelClass {
    constructor(
        public id: string,
        public login: string,
        public email: string,
        public createdAt: Date,
        public banInfo: BanInfoClass,
    ) {}
}

export class UserViewModelForBannedUsersByBloggerClass {
    constructor(public id: string, public login: string, public banInfo: BanInfoClass) {}
}
