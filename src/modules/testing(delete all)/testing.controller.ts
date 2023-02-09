import { Controller, Delete, HttpCode } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@SkipThrottle()
@Controller("testing")
export class TestingController {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    @Delete("/all-data")
    @HttpCode(204)
    async deleteBlog(): Promise<boolean> {
        await this.dataSource.query(
            `TRUNCATE "bannedBlogs",users,blogs,devices,"loginAttempts",
            "posts","usersWhoPutLikeForPost","usersWhoPutDislikeForPost","comments",
            "usersWhoPutLikeForComment","usersWhoPutDislikeForComment"`,
        );
        return true;
    }
}
