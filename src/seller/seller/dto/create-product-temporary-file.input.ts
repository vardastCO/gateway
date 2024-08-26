import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MaxLength,
  Validate,
} from "class-validator";



@InputType()
export class CreateProductTemporaryfileInput {
  @Field()
  @IsNotEmpty()
  @IsInt()
  file_id: number;

  @Field()
  @IsNotEmpty()
  @IsInt()
  product_temp_id: number;
  
}
