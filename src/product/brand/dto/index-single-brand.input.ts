import { Field, InputType ,Int} from "@nestjs/graphql";
import { IsOptional,IsNotEmpty, IsEnum} from "class-validator";
import { BrandTypeEnum } from "../enums/brnad-type.enum";


@InputType()
export class IndexSingleBrandInput  {
  @Field(type => Int)
  @IsNotEmpty()
  id: number;

  @Field(() => BrandTypeEnum, {
    defaultValue: BrandTypeEnum.CATALOGUE,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(BrandTypeEnum)
  type?: BrandTypeEnum = BrandTypeEnum.CATALOGUE;
  
}
