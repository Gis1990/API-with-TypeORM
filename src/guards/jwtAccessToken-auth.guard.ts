import { ContextType, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class JwtAccessTokenAuthGuard extends AuthGuard("jwt") {
    handleRequest(err, user) {
        if (err || !user) {
            throw new HttpException("Unauthorized", 401);
        }
        return user;
    }

    getRequest(context: ExecutionContext) {
        if (context.getType<ContextType | "graphql">() === "graphql") {
            return GqlExecutionContext.create(context).getContext().req;
        }
        return context.switchToHttp().getRequest();
    }
}
