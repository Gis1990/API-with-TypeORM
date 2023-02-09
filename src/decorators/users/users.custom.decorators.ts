import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationOptions,
    registerDecorator,
} from "class-validator";

import { HttpException, Injectable } from "@nestjs/common";
import { GetUserByIdCommand } from "../../queries/users/get-user-by-id-query";
import { QueryBus } from "@nestjs/cqrs";
import { GetUserByLoginOrEmailCommand } from "../../queries/users/get-user-by-login-or-email-query";

@ValidatorConstraint({ name: "IsUsersIdExist", async: true })
@Injectable()
export class IsUsersIdExistConstraint implements ValidatorConstraintInterface {
    constructor(private queryBus: QueryBus) {}

    async validate(userId: number) {
        const user = await this.queryBus.execute(new GetUserByIdCommand(userId));
        if (!user) {
            throw new HttpException("User not found", 404);
        } else {
            return true;
        }
    }
}

export function IsUsersIdExist(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUsersIdExistConstraint,
        });
    };
}

@ValidatorConstraint({ name: "IsEmailExist", async: true })
@Injectable()
export class IsEmailExistConstraint implements ValidatorConstraintInterface {
    constructor(private queryBus: QueryBus) {}

    async validate(value: string) {
        const user = await this.queryBus.execute(new GetUserByLoginOrEmailCommand(value));
        return !user;
    }
}

export function IsEmailExist(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailExistConstraint,
        });
    };
}

@ValidatorConstraint({ name: "IsLoginExist", async: true })
@Injectable()
export class IsLoginExistConstraint implements ValidatorConstraintInterface {
    constructor(private queryBus: QueryBus) {}

    async validate(value: string) {
        const user = await this.queryBus.execute(new GetUserByLoginOrEmailCommand(value));
        return !user;
    }
}

export function IsLoginExist(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsLoginExistConstraint,
        });
    };
}

@ValidatorConstraint({ name: "IsEmailExistOrConfirmed", async: true })
@Injectable()
export class IsEmailExistOrConfirmedConstraint implements ValidatorConstraintInterface {
    constructor(private queryBus: QueryBus) {}

    async validate(value: string) {
        const user = await this.queryBus.execute(new GetUserByLoginOrEmailCommand(value));
        if (!user) {
            return false;
        } else {
            return !user.emailConfirmed;
        }
    }
}

export function IsEmailExistOrConfirmed(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailExistOrConfirmedConstraint,
        });
    };
}
