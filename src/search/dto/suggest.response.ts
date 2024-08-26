import { Field, ObjectType } from "@nestjs/graphql";
import { brandDto } from "src/product/brand/dto/brandDto";
import { CategoryDTO } from "src/product/category/dto/categoryDto";
import { ProductDTO } from "src/product/product/dto/productDTO";
import { SellerDTO } from "src/seller/seller/dto/sellerDTO";


@ObjectType()
export class SuggestResponse {
  @Field(() => [ProductDTO], { nullable: "items" })
  products: ProductDTO[];

  @Field(() => [CategoryDTO], { nullable: "items" })
  categories: CategoryDTO[];
  
  @Field(() => [SellerDTO], { nullable: "items" })
  seller: SellerDTO[];

  @Field(() => [brandDto], { nullable: "items" })
  brand: brandDto[];

}
