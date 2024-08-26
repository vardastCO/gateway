import { InputType,Field } from "@nestjs/graphql";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";
import { IsNotEmpty, IsEnum, IsInt, IsOptional } from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";
import { SortFieldOffer } from "../enums/sort-filed-offer.enum";

@InputType()
export class IndexPublicofferInput extends PaginationInput {
  
    @Field()
    @IsNotEmpty()
    @IsInt()
    productId: number;
  
    @Field(() => SortFieldOffer, {
        defaultValue: SortFieldOffer.TIME,
        nullable: true,
      })
    @IsNotEmpty()
    @IsEnum(SortFieldOffer)
    sortField?: SortFieldOffer = SortFieldOffer.TIME;

    @Field(() => SortDirection, {
        defaultValue: SortDirection.ASC,
        nullable: true,
        })
    @IsNotEmpty()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.ASC;
}
