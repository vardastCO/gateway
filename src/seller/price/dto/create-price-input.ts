import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum
} from "class-validator";
import { DiscountTypesEnum } from "../enums/price-discount-types.enum";

@InputType()
export class CreatePriceInput {

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @Field(() => String)
  @IsNotEmpty()
  amount: string;

  @Field({ nullable: true })
  @IsOptional()
  inventory: string;

  @Field({ nullable: true })
  @IsOptional()
  expired_at: string;

  @Field({ nullable: true })
  @IsBoolean()
  isPublic: boolean = true;

  @Field({ nullable: true })
  @IsOptional()
  orginal_price: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  valueDiscount?: string;


  @Field(() => DiscountTypesEnum, { nullable: true})
  @IsEnum(DiscountTypesEnum)
  @IsOptional()
  typeDiscount?: DiscountTypesEnum;
}
