export class BlogViewModelClass {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public createdAt: Date,
        public isMembership: boolean,
    ) {}
}

export class BlogViewModelForSaClass {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public createdAt: Date,
        public blogOwnerInfo: {
            userId: string;
            userLogin: string;
        },
        public banInfo: {
            isBanned: boolean;
            banDate: Date;
        },
        public isMembership: boolean,
    ) {}
}

export class BlogViewModelClassPagination {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: BlogViewModelClass[],
    ) {}
}

export class BlogViewModelForSaPaginationClass {
    constructor(
        public pagesCount: number,
        public page: number,
        public pageSize: number,
        public totalCount: number,
        public items: BlogViewModelForSaClass[],
    ) {}
}
