import { Module } from "@nestjs/common";
import { SecurityService } from "./security.service";
import { SecurityController } from "./security.controller";
import { UsersQueryRepository } from "../../query-repositories/users.query.repository";
import { UsersRepository } from "../../repositories/users.repository";
import { IsDeviceIdExistConstraint } from "../../decorators/security/security.devices.custom.decorators";
import { CheckAccessRightsUseCase } from "../../commands/security/check-access-rights-use-case";
import { TerminateAllDevicesUseCase } from "../../commands/security/terminate-all-devices-use-case";
import { ReturnAllDevicesUseCase } from "../../commands/security/return-all-devices-use-case";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "../../queries/users/get-user-by-id-query";
import { GetUserByDeviceIdQuery } from "../../queries/users/get-user-by-device-id-query";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../../schemas/users.schema";
import { Devices } from "../../schemas/devices.schema";

const useCases = [CheckAccessRightsUseCase, TerminateAllDevicesUseCase, ReturnAllDevicesUseCase];
const queries = [GetUserByIdQuery, GetUserByDeviceIdQuery];

@Module({
    controllers: [SecurityController],
    providers: [
        SecurityService,
        UsersQueryRepository,
        UsersRepository,
        IsDeviceIdExistConstraint,
        ...useCases,
        ...queries,
    ],
    imports: [CqrsModule, TypeOrmModule.forFeature([Users, Devices])],
})
export class SecurityModule {}
