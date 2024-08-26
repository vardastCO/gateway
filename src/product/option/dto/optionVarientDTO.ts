import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OptionVarientValueDTO {
  @Field(() => Int)
  productId: number;

  @Field()
  value: string;

  constructor(data: Partial<OptionVarientValueDTO>) {
    Object.assign(this, data);
  }
}
