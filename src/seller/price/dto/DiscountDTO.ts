import { Field, ObjectType } from "@nestjs/graphql";
// import { DiscountTypesEnum } from "../enums/price-discount-types.enum";

@ObjectType()
export class DiscountDTO {
  @Field()
  value: string;

  @Field()
  orginal_price: string;

  @Field()
  type: string;

  @Field()
  calculated_price: string;

  constructor(data: Partial<DiscountDTO>) {
    Object.assign(this, data);
  }
}
