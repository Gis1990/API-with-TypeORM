import "reflect-metadata";
import { useContainer } from "class-validator";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exception.filter";
import cookieParser from "cookie-parser";

export const validationPipeSettings = {
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((e) => {
            const constraintsKeys = Object.keys(e.constraints);
            constraintsKeys.forEach((key) => {
                errorsForResponse.push({
                    message: e.constraints[key],
                    field: e.property,
                });
            });
        });
        throw new BadRequestException(errorsForResponse);
    },
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe(validationPipeSettings));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.get(ConfigService);
    await app.listen(500);
}

bootstrap();
