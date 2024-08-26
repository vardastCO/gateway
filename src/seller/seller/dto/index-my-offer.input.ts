import { InputType,Field } from "@nestjs/graphql";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";
import { IsBoolean, IsEnum, IsInt, IsOptional } from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

@InputType()
export class IndexMyofferInput extends PaginationInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    sellerId?: number;
  
    @Field({ nullable: true })
    @IsOptional()
    @IsInt()
    productId?: number;

    @Field({ nullable: true })
    @IsOptional()
    query?: string;
  
    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
  
    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
  
    @Field(() => ThreeStateSupervisionStatuses, { nullable: true })
    @IsOptional()
    @IsEnum(ThreeStateSupervisionStatuses)
    status?: ThreeStateSupervisionStatuses;
}
