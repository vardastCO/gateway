import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LowestPriceDTO {
  @Field()
  amount: string;

  @Field()
  createdAt: string;

  @Field({nullable:true})
  amountwithdiscount?: string;

  @Field({nullable:true})
  percentdiscount?: string;

  constructor(data: Partial<LowestPriceDTO>) {
    Object.assign(this, data);
  }
}
