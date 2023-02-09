import { InputModelForPasswordRecovery } from "../../dtos/auth.dto";
import { BcryptService } from "../../modules/utils/bcrypt/bcrypt.service";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { UsersRepository } from "../../repositories/users.repository";
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { GetUserByLoginOrEmailCommand } from "../../queries/users/get-user-by-login-or-email-query";
import { SendEmailForPasswordRecoveryCommand } from "../email/send-email-for-password-recovery-use-case";

export class PasswordRecoveryCommand {
    constructor(public readonly dto: InputModelForPasswordRecovery) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
    constructor(
        private queryBus: QueryBus,
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService,
        private commandBus: CommandBus,
    ) {}

    async execute(command: PasswordRecoveryCommand): Promise<true> {
        const user = await this.queryBus.execute(new GetUserByLoginOrEmailCommand(command.dto.email));
        if (user) {
            const recoveryCode = uuidv4();
            const expirationDate = add(new Date(), { hours: 1 });
            await this.commandBus.execute(new SendEmailForPasswordRecoveryCommand(command.dto.email, recoveryCode));
            await this.usersRepository.addPasswordRecoveryCode(user.id, recoveryCode, expirationDate);
            return true;
        } else {
            return true;
        }
    }
}
