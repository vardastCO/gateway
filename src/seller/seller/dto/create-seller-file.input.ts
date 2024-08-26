import { Field, InputType,Int } from "@nestjs/graphql";

import {
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { IsEnum} from "class-validator";
import { SellerTypeEnum } from "../enums/seller-type.enum";


@InputType()
export class CreateSellerFileInput {
  @Field(() => Int)
  @IsNotEmpty()
  sellerId: number;

  @Field(() => Int)
  @IsNotEmpty()
  fileId: number;

  @Field(() => SellerTypeEnum, {
    defaultValue: SellerTypeEnum.LOGO,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SellerTypeEnum)
  type?: SellerTypeEnum = SellerTypeEnum.LOGO;
}
