import { Field, Int, ObjectType, } from "@nestjs/graphql";
import { IsBoolean, IsDate, IsNumber, IsOptional } from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { ProductDTO } from "src/product/product/dto/productDTO";
import { SellerDTO } from "./sellerDTO";
import { PriceInfoDTO } from "src/seller/price/dto/price-info-input";

@ObjectType()
export class OfferDTO {
  @Field(() => Int)
  id: number;

  @Field(() => SellerDTO)
  seller: SellerDTO;

  @Field(() => ProductDTO)
  product: ProductDTO;

  @Field(() => Int,{nullable:true})
  productId: number;

  @Field(() => ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isExpired: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  total_inventory?: number;

  @Field({ nullable: true })
  @IsOptional()
  createdAt: string;

  @Field({ nullable: true })
  @IsOptional()
  updatedAt: string;

  @Field({ nullable: true })
  @IsOptional()
  deletedAt: string;
  
  @Field(() => [PriceInfoDTO], { nullable: true })
  price: PriceInfoDTO[];

  @Field({ nullable: true })
  @IsOptional()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  last_price: string;

}
