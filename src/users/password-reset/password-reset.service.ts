import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { hash } from "argon2";
import { KavenegarService } from "src/base/kavenegar/kavenegar.service";
import { MoreThanOrEqual } from "typeorm";
import { OneTimePassword } from "../registration/entities/one-time-password.entity";
import { AuthStates } from "../registration/enums/auth-states.enum";
import { OneTimePasswordStates } from "../registration/enums/one-time-password-states.enum";
import { OneTimePasswordTypes } from "../registration/enums/one-time-password-types.enum";
import { User } from "../user/entities/user.entity";
import { PasswordResetInput } from "./dto/password-reset.input";
import { PasswordResetResponse } from "./dto/password-reset.response";

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly configService: ConfigService,
    private readonly kavenegarService: KavenegarService,
  ) {}

  async passwordReset(
    passwordResetInput: PasswordResetInput,
  ): Promise<PasswordResetResponse> {
    const now = new Date();
    now.setSeconds(
      now.getSeconds() -
        OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
    );
    const lastRecentValidatedOtp = await OneTimePassword.createQueryBuilder()
      .select("id")
      .where({
        id: passwordResetInput.validationKey,
        // validatedAt: MoreThanOrEqual(now),
      })
      .getOne()
    ;
    
    if (!lastRecentValidatedOtp) {
      return {
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message:
          "اطلاعات نمونه فرآیند فراموشی رمز عبور یافت نشد. لطفا فرآیند را از ابتدا شروع نمایید.",
      };
    }

    const user = await User.createQueryBuilder()
      .addSelect("password")
      .where("cellphone = :cellphone", { cellphone: lastRecentValidatedOtp.receiver })
      .getOne()
    ;

    if (!user) {
      return {
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message:
          "خطایی در عملیات بوجود آمده. لطفا فرآیند را از ابتدا شروع نمایید.",
      };
    }
    user.password = await hash(passwordResetInput.password);

    await user.save();

    return {
      nextState: AuthStates.LOGIN,
      message:
        "رمز عبور شما با موفقیت تغییر یافت. لطفا وارد حساب کاربری خود شوید.",
    };
  }
}
