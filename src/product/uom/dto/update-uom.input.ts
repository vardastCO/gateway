import { IsInt, IsNotEmpty } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreateUomInput } from "./create-uom.input";

@InputType()
export class UpdateUomInput extends PartialType(CreateUomInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
