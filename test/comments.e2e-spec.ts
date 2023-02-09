import "reflect-metadata";
import * as request from "supertest";
import {
    app,
    createBlogForTests,
    createOutputCommentForTesting,
    createPostForTesting,
    CreatingUsersForTesting,
    setupTestApp,
    teardownTestApp,
} from "./test.functions";

describe("comments endpoint (e2e)", () => {
    let accessTokenForUser1;
    let accessTokenForUser2;
    let userId2;
    let userLogin2;

    beforeAll(async () => {
        await setupTestApp();
        await request(app.getHttpServer()).delete("/testing/all-data").expect(204);
        const result = await CreatingUsersForTesting();
        accessTokenForUser1 = result.accessTokenForUser1;
        accessTokenForUser2 = result.accessTokenForUser2;
        userId2 = result.userId2;
        userLogin2 = result.userLogin2;
    });
    afterAll(async () => {
        await teardownTestApp();
    });
    describe("GET -> /comments/:id", () => {
        it("2.Should return status 204  (/post)", async () => {
            // create a blog for testing
            const correctBlog = createBlogForTests(10, 5, true);

            // send a POST request to create the blog and expect a 201 response
            const response2 = await request(app.getHttpServer())
                .post("/blogger/blogs")
                .set("authorization", "Bearer " + accessTokenForUser1)
                .send(correctBlog)
                .expect(201);

            // get the id of the created blog
            const blogId = response2.body.id;

            // create a post for testing
            const correctNewPost = createPostForTesting(15, 30, 200, blogId);

            // send a POST request to create the post and expect a 201 response
            const response3 = await request(app.getHttpServer())
                .post(`/blogger/blogs/${blogId}/posts`)
                .set("authorization", "Bearer " + accessTokenForUser1)
                .send(correctNewPost)
                .expect(201);

            // get the id of the created post
            const postId = response3.body.id;

            // create a comment for testing
            const outputComment1 = createOutputCommentForTesting(50, userId2, userLogin2, 0, 0, "None");

            // send a POST request to create the comment and expect a 201 response
            const response4 = await request(app.getHttpServer())
                .post(`/posts/${postId}/comments`)
                .set("authorization", "Bearer " + accessTokenForUser2)
                .send({ content: outputComment1.content })
                .expect(201);

            // check if the response body matches the expected comment
            expect(response4.body).toEqual(outputComment1);

            // get the id of the created comment
            const commentId = response4.body.id;
            // Ban the user
            const response5 = await request(app.getHttpServer())
                .put(`/sa/users/${userId2}/ban`)
                .set("authorization", "Basic YWRtaW46cXdlcnR5")
                .send({
                    isBanned: true,
                    banReason: "stringstringstringst",
                })
                .expect(204);

            await request(app.getHttpServer()).get(`/comments/5`).expect(404);
            await request(app.getHttpServer()).get(`/comments/${commentId}`).expect(404);
            // UnBan the user
            const response6 = await request(app.getHttpServer())
                .put(`/sa/users/${userId2}/ban`)
                .set("authorization", "Basic YWRtaW46cXdlcnR5")
                .send({
                    isBanned: false,
                    banReason: "stringstringstringst",
                })
                .expect(204);
            await request(app.getHttpServer()).get(`/comments/${commentId}`).expect(200);

            await request(app.getHttpServer()).delete(`/blogger/blogs/${blogId}/posts/${postId}`).expect(401);

            await request(app.getHttpServer())
                .delete(`/blogger/blogs/5/posts/${postId}`)
                .set("authorization", "Bearer " + accessTokenForUser1)
                .expect(404);

            await request(app.getHttpServer())
                .delete(`/blogger/blogs/5/posts/1`)
                .set("authorization", "Bearer " + accessTokenForUser1)
                .expect(404);

            await request(app.getHttpServer())
                .delete(`/blogger/blogs/${blogId}/posts/${postId}`)
                .set("authorization", "Bearer " + accessTokenForUser1)
                .expect(204);

            await request(app.getHttpServer())
                .delete(`/blogger/blogs/${blogId}/posts/${postId}`)
                .set("authorization", "Bearer " + accessTokenForUser1)
                .expect(404);
        });
    });
});
