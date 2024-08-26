import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateSellerInput } from "./create-seller.input";
import { IsInt, IsOptional } from "class-validator";
@InputType()
export class UpdateSellerInput extends PartialType(CreateSellerInput) {

    @Field({nullable:true})
    @IsOptional()
    @IsInt()
    id?: number;

    @Field({nullable:true})
    @IsOptional()
    rating?: string;

    @Field({nullable:true})
    @IsOptional()
    logo_file_id?: string;
}
