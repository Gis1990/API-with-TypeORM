import { Module } from "@nestjs/common";
import { config } from "./config/config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlogsModule } from "./modules/blogs/blogs.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { BloggerModule } from "./modules/blogger/blogger.module";
import { SuperAdminModule } from "./modules/super-admin/super.admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TestingModule } from "./modules/testing(delete all)/testing.module";
import { SecurityModule } from "./modules/security/security.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { PostsModule } from "./modules/posts/posts.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("host"),
                port: 5432,
                username: "postgres",
                password: configService.get("dbPassword"),
                database: "bloggersOnTypeORM",
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({ isGlobal: true, load: [config] }),
        // ThrottlerModule.forRoot({
        //     ttl: 10,
        //     limit: 5,
        // }),
        BlogsModule,
        PostsModule,
        AuthModule,
        CommentsModule,
        TestingModule,
        SecurityModule,
        BloggerModule,
        SuperAdminModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // {
        //     provide: APP_GUARD,
        //     useClass: ThrottlerGuard,
        // },
    ],
})
export class AppModule {}
