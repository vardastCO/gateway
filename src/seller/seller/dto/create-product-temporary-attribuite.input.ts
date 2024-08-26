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
export class CreateProductTemporaryAttribuiteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  attribuite: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;

  @Field()
  @IsNotEmpty()
  @IsInt()
  product_temp_id: number;
  
}
