import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SellerStats {
  @Field()
  brandsCount: number;

  @Field()
  categoriesCount: number;

  @Field()
  productsCount: number;

  @Field()
  viewsCount: number;
}

