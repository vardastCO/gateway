import { Field, InputType ,Int} from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";


@InputType()
export class IndexBrandInput extends PaginationInput {
  @Field(type => Int, { nullable: true })
  @IsOptional()
  id?: number;
}
