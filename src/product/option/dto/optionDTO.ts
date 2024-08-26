import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OptionVarientValueDTO } from "./optionVarientDTO";


@ObjectType()
export class OptionDTO {
  @Field(() => Int)
  id: number;

  @Field(() => String) 
  attribute: String;

  @Field(() => [OptionVarientValueDTO], { nullable: true }) 
  variantValues: OptionVarientValueDTO[];

  @Field(() => String) 
  variantValue: String;

  constructor(data: Partial<OptionDTO>) {
    Object.assign(this, data);
  }
}
