import { Field, ObjectType } from "@nestjs/graphql";
import { DiscountDTO } from "./DiscountDTO";
import { MessageEnum } from "src/product/product/enums/message.enum";

@ObjectType()
export class PriceDTO {
  @Field()
  amount: string;

  @Field()
  createdAt: string;

  @Field()
  message: string
  
  @Field(() => DiscountDTO, { nullable: true })
  discount: DiscountDTO;

  constructor(data: Partial<PriceDTO>) {
    Object.assign(this, data);
  }
}
