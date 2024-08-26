import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNotEmpty, MaxLength, Validate } from "class-validator";


@InputType()
export class CreateUomInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  symbol: string;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
