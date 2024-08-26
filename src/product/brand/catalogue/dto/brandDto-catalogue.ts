// src/brand/catalogue/dto/catalogue.dto.ts
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BrandCatalogueDto {

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  fileType?: string;
}