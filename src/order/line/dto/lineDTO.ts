import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LineDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  pre_order_id: number;

  @Field({ nullable: true })
  item_name: string;
  
  @Field({ nullable: true })
  attribuite: string;

  @Field({ nullable: true })
  uom: string;

  @Field({ nullable: true })
  brand: string;

  @Field({ nullable: true })
  qty: string;

  @Field({ nullable: true })
  descriptions: string;

  @Field({ nullable: true })
  created_at: string;
}
