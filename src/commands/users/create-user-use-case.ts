import { CreatedNewUserDto, InputModelForCreatingNewUser } from "../../dtos/users.dto";
import { UserViewModelClass } from "../../entities/users.entity";
import { UsersRepository } from "../../repositories/users.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersFactory } from "../../factories/users.factory";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";

export class CreateUserCommand {
    constructor(
        public readonly dto: InputModelForCreatingNewUser,
        public readonly passwordHash: string,
        public readonly isConfirmed: boolean,
    ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(private usersRepository: UsersRepository) {}

    async execute(command: CreateUserCommand): Promise<UserViewModelClass> {
        const createdNewUserDto: CreatedNewUserDto = {
            login: command.dto.login,
            email: command.dto.email,
            passwordHash: command.passwordHash,
            createdAt: new Date(),
            emailConfirmed: command.isConfirmed,
            emailConfirmationCode: uuidv4(),
            emailExpirationDate: add(new Date(), { hours: 1 }),
            emailRecoveryCode: null,
            emailRecoveryExpirationDate: null,
            isBanned: false,
            banDate: null,
            banReason: null,
            currentSessionLastActiveDate: null,
            currentSessionDeviceId: null,
            currentSessionIp: null,
            currentSessionTitle: null,
            sentEmails: [],
        };
        const createdUser = await this.usersRepository.createUser(createdNewUserDto);
        return UsersFactory.createUserViewModelClass(createdUser);
    }
}
