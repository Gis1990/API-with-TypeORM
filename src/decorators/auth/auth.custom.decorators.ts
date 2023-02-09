import { ContextType, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentUserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user.id;
});

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    if (context.getType<ContextType | "graphql">() === "graphql") {
        return GqlExecutionContext.create(context).getContext().req.user;
    }
    return context.switchToHttp().getRequest().user;
});
