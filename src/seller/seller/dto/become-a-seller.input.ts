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
export class BecomeASellerInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  rating ?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  logo_fileId ?: number;


  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  cityId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;


  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
