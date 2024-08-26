import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int,{ nullable: true })
  @IsOptional()
  @IsInt()
  id: number;
}
