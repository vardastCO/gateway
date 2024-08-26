import { Field, ObjectType } from "@nestjs/graphql";
import { UOMDto } from "./uomDto";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";

@ObjectType()
export class PaginationUomResponse extends PaginationResponse {
  @Field(() => [UOMDto], { nullable: "items" })
  data: UOMDto[];
}
