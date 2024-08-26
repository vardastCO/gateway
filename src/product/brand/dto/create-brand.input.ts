import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MaxLength,
} from "class-validator";



@InputType()
export class CreateBrandInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name_fa: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name_en?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  made_in?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  province_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  city_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  rating ?: number;


}
