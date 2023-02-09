import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { UserModelClass } from "../../dtos/users.dto";

export class GetUserByIdCommand {
    constructor(public readonly userId: number) {}
}

@QueryHandler(GetUserByIdCommand)
export class GetUserByIdQuery implements IQueryHandler<GetUserByIdCommand> {
    constructor(private usersQueryRepository: UsersQueryRepository) {}

    async execute(query: GetUserByIdCommand): Promise<UserModelClass | null> {
        return await this.usersQueryRepository.getUserById(query.userId);
    }
}
