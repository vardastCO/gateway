import { ValidationPipe } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "../auth/decorators/public.decorator";
import { ValidateCellphoneInput } from "./dto/validate-cellphone.input";
import { ValidateCellphoneResponse } from "./dto/validate-cellphone.response";
import { ValidateOtpInput } from "./dto/validate-otp.input";
import { ValidateOtpResponse } from "./dto/validate-otp.response";
import { RegistrationService } from "./registration.service";
@Resolver()
export class RegistrationResolver {
  constructor(private readonly registrationService: RegistrationService) {}

  @Mutation(() => ValidateCellphoneResponse)
  @Public()
  sendOTP(
    @Args("ValidateCellphoneInput", new ValidationPipe({ transform: true }))
    validateCellphoneInput: ValidateCellphoneInput,
  ) {
    return this.registrationService.sendOTP(
      validateCellphoneInput,
    );
  }

  @Mutation(() => ValidateOtpResponse)
  @Public()
  validateOtp(
    @Args("ValidateOtpInput") validateOtpInput: ValidateOtpInput,
  ) {
    return this.registrationService.validateOtp(
      validateOtpInput,
    );
  }

}
