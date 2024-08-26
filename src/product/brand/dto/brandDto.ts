import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FileBrandDTO } from "src/asset/dto/fileBrandDTO";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";


@ObjectType()
export class brandDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  name_en?: string;

  @Field(() => String, { nullable: true })
  name_fa?: string;

  @Field(() => Int, { defaultValue: 1 })
  sum: number;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => Int, { nullable: true })
  rating?: number = 4;

  @Field(() => Int, { nullable: true })
  views?: number = 0;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Boolean, { nullable: true })
  hasPriceList?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasCatalogeFile?: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;


  @Field(() => Int, { nullable: true })
  sellersCount?: number;

  @Field(() => Int, { nullable: true })
  categoriesCount?: number;

  @Field({ nullable: true })
  imageUrl: string;

  @Field(() => [FileBrandDTO],{ nullable: true })
  files?: FileBrandDTO[];

  @Field(() => ThreeStateSupervisionStatuses,{ nullable: true }) 
  status: ThreeStateSupervisionStatuses;

}
