export const config = () => ({
    mongo_URI: process.env.MONGO_URI || "mongodb://localhost:27017/blog",
    login: process.env.LOGIN || "name",
    password: process.env.BASIC_PASSWORD || "basic",
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || "secret",
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || "mysecret",
    mailPass: process.env.MAIL_PASS,
    ttl: process.env.TTL || 10,
    limit: process.env.LIMIT || 5,
    host: process.env.HOST || "localhost",
    dbPassword: process.env.DBPASSWORD || "postgres",
});
