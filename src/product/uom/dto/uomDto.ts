import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UOMDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  symbol: string;

  @Field()
  isActive: boolean;

}
