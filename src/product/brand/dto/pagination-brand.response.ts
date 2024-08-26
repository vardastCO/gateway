import { Field, ObjectType } from "@nestjs/graphql";
import { brandDto } from "./brandDto";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";

@ObjectType()
export class PaginationBrandResponse extends PaginationResponse {
  @Field(() => [brandDto], { nullable: "items" })
  data: brandDto[];
}
