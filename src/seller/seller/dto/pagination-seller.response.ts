import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { SellerDTO } from "./sellerDTO";

@ObjectType()
export class PaginationSellerResponse extends PaginationResponse {
  @Field(() => [SellerDTO], { nullable: "items" })
  data: SellerDTO[];
}
