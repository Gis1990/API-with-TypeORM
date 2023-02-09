import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users.repository";

@Injectable()
export class SecurityService {
    constructor(private usersRepository: UsersRepository) {}

    async terminateSpecificDevice(deviceId: string): Promise<boolean> {
        return await this.usersRepository.terminateSpecificDevice(deviceId);
    }
}
