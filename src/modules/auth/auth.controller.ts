import { Body, Controller, HttpCode, Post, UseGuards, Res, Get } from "@nestjs/common";
import { InputModelForCreatingNewUser } from "../../dtos/users.dto";
import {
    CurrentUserModel,
    CurrentUserModelForMeEndpoint,
    CurrentUserWithDevicesDataModel,
    InputModelForCode,
    InputModelForNewPassword,
    InputModelForPasswordRecovery,
    InputModelForResendingEmail,
} from "../../dtos/auth.dto";
import { LocalAuthGuard } from "../../guards/local-auth.guard";
import { Response } from "express";
import { AccessTokenClass } from "../../entities/auth.entities";
import { JwtRefreshTokenAuthGuard } from "../../guards/jwtRefreshToken-auth.guard";
import { CurrentUser } from "../../decorators/auth/auth.custom.decorators";
import { SkipThrottle } from "@nestjs/throttler";
import { JwtAccessTokenAuthGuard } from "../../guards/jwtAccessToken-auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { PasswordRecoveryCommand } from "../../commands/auth/password-recovery-use-case";
import { AcceptNewPasswordCommand } from "../../commands/auth/accept-new-password-use-case";
import { ConfirmEmailCommand } from "../../commands/auth/confirm-email-use-case";
import { CreateUserWithConfirmationEmailCommand } from "../../commands/auth/create-user-with-confirmation-email-use-case";
import { RegistrationEmailResendingCommand } from "../../commands/auth/registration-email-resending-use-case";
import { RefreshAllTokensCommand } from "../../commands/auth/refresh-all-tokens-use-case";
import { RefreshOnlyRefreshTokenCommand } from "../../commands/auth/refresh-only-refresh-token-use-case";

@SkipThrottle()
@Controller("auth")
export class AuthController {
    constructor(private commandBus: CommandBus) {}

    @SkipThrottle(false)
    @Post("password-recovery")
    @HttpCode(204)
    async passwordRecovery(@Body() dto: InputModelForPasswordRecovery): Promise<boolean> {
        return await this.commandBus.execute(new PasswordRecoveryCommand(dto));
    }

    @SkipThrottle(false)
    @Post("new-password")
    @HttpCode(204)
    async newPassword(@Body() dto: InputModelForNewPassword): Promise<boolean> {
        return await this.commandBus.execute(new AcceptNewPasswordCommand(dto));
    }

    @SkipThrottle(false)
    @Post("registration-confirmation")
    @HttpCode(204)
    async confirmRegistration(@Body() body: InputModelForCode): Promise<boolean> {
        return await this.commandBus.execute(new ConfirmEmailCommand(body.code));
    }

    @SkipThrottle(false)
    @Post("registration")
    @HttpCode(204)
    async createNewUser(@Body() dto: InputModelForCreatingNewUser): Promise<boolean> {
        return await this.commandBus.execute(new CreateUserWithConfirmationEmailCommand(dto));
    }

    @SkipThrottle(false)
    @Post("registration-email-resending")
    @HttpCode(204)
    async registrationEmailResending(@Body() dto: InputModelForResendingEmail): Promise<boolean> {
        return await this.commandBus.execute(new RegistrationEmailResendingCommand(dto));
    }

    @SkipThrottle(false)
    @UseGuards(LocalAuthGuard)
    @Post("login")
    @HttpCode(200)
    async login(
        @CurrentUser() userWithDeviceData: CurrentUserWithDevicesDataModel,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenClass> {
        const result = await this.commandBus.execute(new RefreshAllTokensCommand(userWithDeviceData));
        const accessToken = result[0];
        const refreshToken = result[1];
        response.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 2 * 1000, // 20 seconds
        });
        return new AccessTokenClass(accessToken);
    }

    @UseGuards(JwtRefreshTokenAuthGuard)
    @Post("refresh-token")
    @HttpCode(200)
    async refreshAllTokens(
        @CurrentUser() userWithDeviceData: CurrentUserWithDevicesDataModel,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenClass> {
        const result = await this.commandBus.execute(new RefreshAllTokensCommand(userWithDeviceData));
        const accessToken = result[0];
        const refreshToken = result[1];
        response.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 2 * 1000, // 20 seconds
        });
        return new AccessTokenClass(accessToken);
    }

    @UseGuards(JwtRefreshTokenAuthGuard)
    @Post("logout")
    @HttpCode(204)
    async logout(
        @CurrentUser() userWithDeviceData: CurrentUserWithDevicesDataModel,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        const newRefreshToken = await this.commandBus.execute(new RefreshOnlyRefreshTokenCommand(userWithDeviceData));
        response.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 2 * 1000, // 20 seconds
        });
        return;
    }

    @UseGuards(JwtAccessTokenAuthGuard)
    @Get("me")
    @HttpCode(200)
    async me(@CurrentUser() user: CurrentUserModel): Promise<CurrentUserModelForMeEndpoint> {
        return {
            email: user.email,
            login: user.login,
            userId: user.id.toString(),
        };
    }
}
