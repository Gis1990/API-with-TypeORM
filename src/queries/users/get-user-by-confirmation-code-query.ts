import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UsersClass } from "../../schemas/users.schema";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";

export class GetUserByConfirmationCodeCommand {
    constructor(public readonly confirmationCode: string) {}
}

@QueryHandler(GetUserByConfirmationCodeCommand)
export class GetUserByConfirmationCodeQuery implements IQueryHandler<GetUserByConfirmationCodeCommand> {
    constructor(private usersQueryRepository: UsersQueryRepository) {}

    async execute(query: GetUserByConfirmationCodeCommand): Promise<UsersClass | null> {
        return await this.usersQueryRepository.getUserByConfirmationCode(query.confirmationCode);
    }
}
