import { Field, InputType ,Int} from "@nestjs/graphql";
import { IsOptional,IsNotEmpty, IsEnum} from "class-validator";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";
import { SortFieldBrand } from "../enums/sort-types.enum";
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";


@InputType()
export class IndexBrandInput extends PaginationInput {
  @Field(type => Int, { nullable: true })
  @IsOptional()
  id?: number;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  sellerId?: number;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  categoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  name_en?: string;


  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasCatalogeFile?: boolean ;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasPriceList?: boolean ;

  @Field(() => SortFieldBrand, {
    defaultValue: SortFieldBrand.RATING,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortFieldBrand)
  sortField?: SortFieldBrand = SortFieldBrand.RATING;


  @Field(() => SortDirection, {
    defaultValue: SortDirection.DESC,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;
  
}
