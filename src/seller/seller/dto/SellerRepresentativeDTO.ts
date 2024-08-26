import { Field, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class SellerRepresentativeDTO {
  @Field(() => Int)
  sellerId: number;

  @Field(() => Int)
  userId: number;

  

}
