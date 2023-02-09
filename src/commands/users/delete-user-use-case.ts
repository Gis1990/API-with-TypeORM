import { UsersRepository } from "../../repositories/users.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteUserCommand {
    constructor(public readonly id: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
    constructor(private usersRepository: UsersRepository) {}

    async execute(command: DeleteUserCommand): Promise<boolean> {
        return this.usersRepository.deleteUserById(Number(command.id));
    }
}
