import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class NewestPriceDTO {
  @Field()
  amount: string;

  @Field()
  createdAt: string;

  @Field({nullable:true})
  amountwithdiscount?: string;

  @Field({nullable:true})
  percentdiscount?: string;

  constructor(data: Partial<NewestPriceDTO>) {
    Object.assign(this, data);
  }
}
