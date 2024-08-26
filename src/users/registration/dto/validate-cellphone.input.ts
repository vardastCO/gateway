import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,IsOptional,IsEnum
} from "class-validator";
import { ValidationTypes } from "../enums/validation-types.enum";

@InputType()
export class ValidateCellphoneInput {

  @Field()
  @IsNotEmpty()
  cellphone: string;

  @IsOptional()
  @IsEnum(ValidationTypes)
  validationType?: ValidationTypes = ValidationTypes.SIGNUP;
}
