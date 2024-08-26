import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { ProductTemporaryDTO } from "./Product-temporary-DTO";

@ObjectType()
export class PaginationTempResponse extends PaginationResponse {
  @Field(() => [ProductTemporaryDTO], { nullable: "items" })
  data: ProductTemporaryDTO[];
}
