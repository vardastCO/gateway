import { Field, Int, ObjectType } from "@nestjs/graphql";
import { brandDto } from "src/product/brand/dto/brandDto";
import { ProductDTO } from "src/product/product/dto/productDTO";
import { SellerDTO } from "src/seller/seller/dto/sellerDTO";

@ObjectType()
export class EntityResponse {
  @Field(() => [brandDto], { nullable: "items" })
  brand?: brandDto[];

  @Field(() => [ProductDTO], { nullable: "items" })
  product?: ProductDTO[];

  @Field(() => [SellerDTO], { nullable: "items" })
  seller?: SellerDTO[];

  @Field(() => Int, { nullable: true })
  id?: number; // Making id optional

  @Field(() => String, { nullable: true })
  error?: string; // Adding an error field
}
