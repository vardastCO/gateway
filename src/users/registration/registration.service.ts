import { BadRequestException, Injectable } from "@nestjs/common";
import { KavenegarService } from "src/base/kavenegar/kavenegar.service";
import { ValidateCellphoneInput } from "./dto/validate-cellphone.input";
import { ValidateCellphoneResponse } from "./dto/validate-cellphone.response";
import { OneTimePassword } from "./entities/one-time-password.entity";
import { AuthStates } from "./enums/auth-states.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { IsNull, MoreThanOrEqual } from "typeorm";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CompressionService } from "src/compression.service";
import { OneTimePasswordTypes } from "./enums/one-time-password-types.enum";
import { ValidateOtpInput } from "./dto/validate-otp.input";
import { ValidateOtpResponse } from "./dto/validate-otp.response";
import { User } from "../user/entities/user.entity";

@Injectable()
export class RegistrationService {
  constructor(private readonly kavenegarService: KavenegarService,
     @Inject(CACHE_MANAGER) private cacheManager: Cache,
     private readonly compressionService: CompressionService,
     ) {}
  async sendOTP(
    validateCellphoneInput: ValidateCellphoneInput,
  ): Promise<ValidateCellphoneResponse> {
    const cacheKey = `lastUnexpiredOtp_{phone:${validateCellphoneInput.cellphone}}`;
    let isNewTokenSend = await this.cacheManager.get(cacheKey);
    let lastUnexpiredOtp
    if (!isNewTokenSend) {
       lastUnexpiredOtp = OneTimePassword.create({
        type: OneTimePasswordTypes.AUTH_SMS_OTP,
        receiver: validateCellphoneInput.cellphone,
      }).generateNewToken();
  
  
      await lastUnexpiredOtp.save();
  
      isNewTokenSend = true;

      const result = this.compressionService.compressData(lastUnexpiredOtp)

      await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
  
    } else {
      isNewTokenSend = false;
    }
  
    
    return {
      validationKey : isNewTokenSend ?  lastUnexpiredOtp.id : null,
      nextState: AuthStates.VALIDATE_OTP,
      message: isNewTokenSend
        ? `رمز یکبار مصرف به شماره ${validateCellphoneInput.cellphone} پیامک شد.`
        : `رمز یکبار مصرف قبلا به شماره ${validateCellphoneInput.cellphone} پیامک شده است.`,
    };
  }

  async validateOtp(
    validateOtpInput: ValidateOtpInput,
  ): Promise<ValidateOtpResponse> {

    const now = new Date();
    now.setSeconds(
      now.getSeconds() - OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS,
    );

    const lastUnexpiredOtp = await OneTimePassword.createQueryBuilder()
      .where({
        id: validateOtpInput.validationKey,
        createdAt: MoreThanOrEqual(now),
      })
      .getOne();

      if (!lastUnexpiredOtp) {
        return {
          nextState: AuthStates.VALIDATE_CELLPHONE,
          message:
            "رمز یکبار مصرف منقضی شده است. لطفا فرآیند را از ابتدا شروع نمایید.",
        };
      }


      if (lastUnexpiredOtp.token !== validateOtpInput.token) {
          return {
            nextState: AuthStates.VALIDATE_CELLPHONE,
            message:
              "رمز یکبار مصرف وارد شده اشتباه است.",
          };
      }
      return {
        validationKey:validateOtpInput.validationKey,
        nextState: AuthStates.LOGIN,
        message: "یک متن تستی",
      };

    }
  

  // async signup(
  //   signupInput: SignupInput,
  //   ipAddress: string,
  // ): Promise<SignupResponse> {
  //   // Check to see if any valid otp exists
  //   const now = new Date();
  //   now.setSeconds(
  //     now.getSeconds() -
  //       OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
  //   );
  //   const lastRecentValidatedOtp = await OneTimePassword.createQueryBuilder()
  //     .where({
  //       id: signupInput.validationKey,
  //       state: OneTimePasswordStates.VALIDATED,
  //       type: OneTimePasswordTypes.AUTH_SMS_OTP,
  //       requesterIp: ipAddress,
  //       validatedAt: MoreThanOrEqual(now),
  //     })
  //     .orderBy({ '"createdAt"': "DESC" })
  //     .getOne();

  //   if (!lastRecentValidatedOtp) {
  //     return {
  //       nextState: AuthStates.VALIDATE_CELLPHONE,
  //       message:
  //         "اطلاعات نمونه فرآیند ثبت نام یافت نشد. لطفا فرآیند را از ابتدا شروع نمایید.",
  //     };
  //   }

  //   const userExists = await User.createQueryBuilder()
  //     .where({
  //       cellphone: lastRecentValidatedOtp.receiver,
  //     })
  //     .getExists();
  //   if (userExists) {
  //     return {
  //       nextState: AuthStates.LOGIN,
  //       message: "ثبت نام قبلا انجام شده است. لطفا از تلاش مجدد پرهیز کنید.",
  //     };
  //   }

  //   lastRecentValidatedOtp.state = OneTimePasswordStates.USED;

  //   const iran = await Country.findOneBy({ alphaTwo: "IR" });
  //   const userRole = await Role.findOneBy({ name : "user"});
  //   const user = User.create({
  //     firstName: signupInput.firstName,
  //     lastName: signupInput.lastName,
  //     email: signupInput.email,
  //     cellphone: lastRecentValidatedOtp.receiver,
  //     isCellphoneVerified: true,
  //     username: lastRecentValidatedOtp.receiver,
  //     password: await hash(signupInput.password),
  //     language: signupInput.language ?? UserLanguagesEnum.FARSI,
  //     timezone: signupInput.timezone ?? "Asia/Terhan",
  //     status: UserStatusesEnum.ACTIVE,
  //     countryId: iran.id,
  //     displayRoleId: userRole.id,
  //   });
  //   user.roles = Promise.resolve([userRole]);

  //   await user.save();
  //   await lastRecentValidatedOtp.save();
  //   // await this.kavenegarService.lookup(user.cellphone, "postSignup", "کاربر");

  //   return {
  //     nextState: AuthStates.LOGIN,
  //     message:
  //       "حساب کاربری شما با موفقیت ایجاد شد و پس از تایید کارشناسان وردست فعال می‌شود." +
  //       "فعال سازی حساب کاربریتان از طریق پیام کوتاه به شما اطلاع رسانی خواهد شد.",
  //   };
  // }
}
