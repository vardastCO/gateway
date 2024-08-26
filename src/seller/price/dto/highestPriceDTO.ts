import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class HighestPriceDTO {
  @Field()
  amount: string;

  @Field()
  createdAt: string;

  @Field({nullable:true})
  amountwithdiscount?: string;

  @Field({nullable:true})
  percentdiscount?: string;

  constructor(data: Partial<HighestPriceDTO>) {
    Object.assign(this, data);
  }
}
