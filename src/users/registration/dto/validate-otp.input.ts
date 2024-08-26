import { Field, InputType } from "@nestjs/graphql";
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  Length,
  MaxLength,
} from "class-validator";

@InputType()
export class ValidateOtpInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;

  @Field()
  @IsNotEmpty()
  @Length(5, 5, { message: "طول رمز یکبار مصرف می‌بایست ۵ کاراکتر باشد." })
  @IsNumberString()
  token: string;
}
