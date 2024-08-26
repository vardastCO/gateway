import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";


@InputType()
export class CreateAddressProjectInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  postalAddress: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  delivery_name: string;

  @Field()
  @IsNotEmpty()
  @IsInt()
  cityId: number;

  @Field()
  @IsNotEmpty()
  @IsInt()
  provinceId: number;

  @Field({ nullable: true })
  @IsOptional()
  postalCode?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  delivery_contact: string;


}
