import { BcryptService } from "../../modules/utils/bcrypt/bcrypt.service";
import { UsersClass } from "../../schemas/users.schema";
import { UsersRepository } from "../../repositories/users.repository";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { GetUserByIdCommand } from "../../queries/users/get-user-by-id-query";
import { GetUserByLoginOrEmailCommand } from "../../queries/users/get-user-by-login-or-email-query";

export class CheckCredentialsCommand {
    constructor(
        public readonly loginOrEmail: string,
        public readonly password: string,
        public readonly ip: string,
        public readonly title: string | undefined,
    ) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase implements ICommandHandler<CheckCredentialsCommand> {
    constructor(
        private queryBus: QueryBus,
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService,
    ) {}

    async execute(command: CheckCredentialsCommand): Promise<UsersClass | null> {
        const user = await this.queryBus.execute(new GetUserByLoginOrEmailCommand(command.loginOrEmail));
        if (!user) return null;
        await this.usersRepository.addLoginAttempt(user.id, command.ip);
        const isHashesEqual = await this.bcryptService._isHashesEquals(command.password, user.passwordHash);
        const lastActiveDate = new Date();
        const deviceId = Number(new Date()).toString();
        if (isHashesEqual && user.emailConfirmed) {
            await this.usersRepository.addUserDevicesData(user.id, command.ip, lastActiveDate, deviceId, command.title);
            await this.usersRepository.addCurrentSession(user.id, command.ip, lastActiveDate, deviceId, command.title);
            return await this.queryBus.execute(new GetUserByIdCommand(user.id));
        } else {
            return null;
        }
    }
}
