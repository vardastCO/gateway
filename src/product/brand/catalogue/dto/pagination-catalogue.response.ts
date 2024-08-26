import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { BrandCatalogueDto } from "./brandDto-catalogue";

@ObjectType()
export class PaginationBrandCatalogueResponse extends PaginationResponse {
  @Field(() => [BrandCatalogueDto], { nullable: "items" })
  data: BrandCatalogueDto[];
}
