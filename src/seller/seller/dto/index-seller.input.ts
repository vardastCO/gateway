import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional,IsEnum ,IsString ,IsNotEmpty} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { SortFieldSeller } from "../enums/sort-types-sellers.enum";

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
@InputType()
export class IndexSellerInput extends IndexInput {
  @Field(() => ThreeStateSupervisionStatuses, { nullable: true })
  @IsOptional()
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field({ nullable: true})
  @IsOptional()
  @IsBoolean()
  ishomePage: boolean = false;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasLogoFile?: boolean ;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  createdById: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  brandId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sort : (SortOrder);

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cityId : (SortOrder);

  @Field(() => SortFieldSeller, {
    defaultValue: SortFieldSeller.CREATED,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortFieldSeller)
  sortField?: SortFieldSeller = SortFieldSeller.CREATED;


  @Field(() => SortDirection, {
    defaultValue: SortDirection.ASC,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
}