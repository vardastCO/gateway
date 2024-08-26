import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional,IsEnum ,IsString ,IsNotEmpty} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexTempInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;
}