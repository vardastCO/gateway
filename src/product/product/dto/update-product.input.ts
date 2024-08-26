import { IsInt, IsNotEmpty,IsString,IsOptional } from "class-validator";
import { CreateProductInput } from "./create-product.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => String) 
  @IsOptional()
  @IsString()
  parent_name: string;
}
