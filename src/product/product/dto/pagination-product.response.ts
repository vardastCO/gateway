import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { ProductDTO } from "./productDTO";

@ObjectType()
export class PaginationProductResponse extends PaginationResponse {
  @Field(() => [ProductDTO], { nullable: "items" })
  data: ProductDTO[];
}
