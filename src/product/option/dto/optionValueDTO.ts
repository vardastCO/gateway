import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OptionValueDTO {
  @Field(() => Int)
  id: number;

  @Field()
  value: string;

  constructor(data: Partial<OptionValueDTO>) {
    Object.assign(this, data);
  }
}
