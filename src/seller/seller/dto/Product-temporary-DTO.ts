import { Field, ObjectType, Int } from "@nestjs/graphql";
import { AttributeValueDto } from "src/product/attribute/dto/attributeValueDto";
import { ImageUrlDTO } from "src/product/image/dto/imageUrlDTO";

@ObjectType()
export class ProductTemporaryDTO {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  length?: string;

  @Field({ nullable: true })
  width?: string;

  @Field({ nullable: true })
  height?: string;

  @Field({ nullable: true })
  weight?: string;

  @Field(() => [ImageUrlDTO], { nullable: true })
  imageUrl: ImageUrlDTO[];

  @Field(() => [AttributeValueDto], { nullable: true }) 
  attributes: AttributeValueDto[];
}
