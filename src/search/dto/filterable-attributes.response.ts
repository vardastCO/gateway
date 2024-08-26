import { Field, ObjectType } from "@nestjs/graphql";
import { AttributeDto } from "src/product/attribute/dto/attributeDto";


@ObjectType()
export class FilterableAttributesResponse {
  @Field(() => [AttributeDto], { nullable: "items" })
  filters: AttributeDto[];
}
