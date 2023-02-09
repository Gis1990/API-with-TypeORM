import { Injectable } from "@nestjs/common";
import { InputModelForCreatingNewUser } from "../../dtos/users.dto";
import { BcryptService } from "../utils/bcrypt/bcrypt.service";
import { UserViewModelClass } from "../../entities/users.entity";
import { CreateUserCommand } from "../../commands/users/create-user-use-case";
import { CommandBus } from "@nestjs/cqrs";

@Injectable()
export class AuthService {
    constructor(private commandBus: CommandBus, private bcryptService: BcryptService) {}

    async createUser(dto: InputModelForCreatingNewUser, isConfirmed: boolean): Promise<UserViewModelClass> {
        const passwordHash = await this.bcryptService._generateHash(dto.password);
        return await this.commandBus.execute(new CreateUserCommand(dto, passwordHash, isConfirmed));
    }
}
