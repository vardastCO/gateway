import { Field, Int,ObjectType } from "@nestjs/graphql";
import { PriceDTO } from "./PriceDTO";

@ObjectType()
export class PriceInfoDTO {

  @Field(() => PriceDTO, { nullable: true })
  value: PriceDTO;

  @Field(() => Int,{nullable:true})
  productId: number;

  @Field(() => String, { nullable: true })
  type: 'LOWEST' | 'HIGHEST' | 'NEWEST' | 'LATEST';


}
