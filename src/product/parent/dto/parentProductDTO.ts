import { Field, Int, ObjectType } from "@nestjs/graphql";
import { brandDto } from "src/product/brand/dto/brandDto";
import { CategoryDTO } from "src/product/category/dto/categoryDto";
import { UOMDto } from "src/product/uom/dto/uomDto";


@ObjectType()
export class ParentProductDTO {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  brandname: string;

  @Field()
  categorytitle: string;

  @Field()
  uomname: string;
}
