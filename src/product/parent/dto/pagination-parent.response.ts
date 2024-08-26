import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { ParentProductDTO } from "./parentProductDTO";

@ObjectType()
export class PaginationParentResponse extends PaginationResponse {
  @Field(() => [ParentProductDTO], { nullable: "items" })
  data: ParentProductDTO[];
}
