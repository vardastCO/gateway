import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from "class-validator";



@InputType()
export class CreateProductTemporaryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  height?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  weight?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  width?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  length?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  brand?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  category?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  description?: string;
  
}
