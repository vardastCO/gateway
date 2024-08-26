import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FileSellerDTO } from "src/asset/dto/fileSellerDTO";
import { brandDto } from "src/product/brand/dto/brandDto";
import { Address } from "src/users/address/entities/address.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";

@ObjectType()
export class SellerDTO {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  sum: string;

  @Field({ nullable: true })
  bio: string;

  @Field(() => Int, { nullable: true })
  rating: number;

  @Field(() => Int, { nullable: true })
  views?: number = 0;

  @Field(() => Boolean)
  isBlueTik: boolean;

  @Field(() => Int, { nullable: true })
  brandsCount: number;
  
  @Field(() => Int, { nullable: true })
  categoriesCount: number;

  @Field(() => [ContactInfo], { nullable: true })
  contact: ContactInfo[];

  @Field(() => [Address], { nullable: true })
  address: Address[];

  @Field(() => [FileSellerDTO],{ nullable: true })
  files?: FileSellerDTO[];

  @Field(() => [brandDto], { nullable: true })
  brands: brandDto[];

}
