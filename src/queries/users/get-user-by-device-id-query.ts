import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { UserModelClass } from "../../dtos/users.dto";

export class GetUserByDeviceIdCommand {
    constructor(public readonly deviceId: string) {}
}

@QueryHandler(GetUserByDeviceIdCommand)
export class GetUserByDeviceIdQuery implements IQueryHandler<GetUserByDeviceIdCommand> {
    constructor(private usersQueryRepository: UsersQueryRepository) {}

    async execute(query: GetUserByDeviceIdCommand): Promise<UserModelClass | null> {
        return await this.usersQueryRepository.getUserByDeviceId(query.deviceId);
    }
}
