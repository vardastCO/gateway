import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { OfferDTO } from "./offerDTO";

@ObjectType()
export class PaginationMyOfferResponse extends PaginationResponse {
  @Field(() => [OfferDTO], { nullable: "items" })
  data: OfferDTO[];
}
