import { Field, InputType,Int } from "@nestjs/graphql";
import { BrandTypeEnum } from "../enums/brnad-type.enum";

import {
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { IsEnum} from "class-validator";


@InputType()
export class CreateBrandFileInput {
  @Field(() => Int)
  @IsNotEmpty()
  brandId: number;

  @Field(() => Int)
  @IsNotEmpty()
  fileId: number;

  @Field(() => BrandTypeEnum, {
    defaultValue: BrandTypeEnum.CATALOGUE,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(BrandTypeEnum)
  type?: BrandTypeEnum = BrandTypeEnum.CATALOGUE;
}
