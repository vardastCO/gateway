import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { AttributeValueDto } from "src/product/attribute/dto/attributeValueDto";
import { ImageUrlDTO } from "src/product/image/dto/imageUrlDTO";
import { OptionDTO } from "src/product/option/dto/optionDTO";
import { ParentProductDTO } from "src/product/parent/dto/parentProductDTO";
// import { LowestPriceDTO } from "src/seller/price/dto/lowestPriceDTO";
// import { NewestPriceDTO } from "src/seller/price/dto/newestPriceDTO";
import { PriceInfoDTO } from "src/seller/price/dto/price-info-input";

@ObjectType()
export class ProductDTO {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  rating: number;

  @Field()
  sku: string;

  @Field(() => [ImageUrlDTO], { nullable: true })
  imageUrl: ImageUrlDTO[];

  @Field(() => [AttributeValueDto], { nullable: true }) 
  attributes: AttributeValueDto[];

  @Field(() => ParentProductDTO, { nullable: true }) 
  parent?: ParentProductDTO;
  
  @Field({ nullable: true })
  parentId: number;

  @Field(() => Int, { nullable: true })
  views?: number = 0;

  // @Field(() => LowestPriceDTO, { nullable: true })
  // lowest_price: LowestPriceDTO;

  // @Field(() => NewestPriceDTO, { nullable: true })
  // newest_price: NewestPriceDTO;

  // @Field(() => LowestPriceDTO, { nullable: true })
  // highest_price: LowestPriceDTO;

  @Field(() => [PriceInfoDTO], { nullable: true })
  price: PriceInfoDTO[];
  
  @Field(() => ThreeStateSupervisionStatuses) 
  status: ThreeStateSupervisionStatuses;

  @Field(() => [OptionDTO], { nullable: true })
  options: OptionDTO[];

  @Field(() => [ProductDTO], { nullable: true })
  varient: ProductDTO[];

  @Field({ nullable: true })
  offers_count: string;
  
  constructor(data: Partial<ProductDTO>) {
    Object.assign(this, data);
  }
}
