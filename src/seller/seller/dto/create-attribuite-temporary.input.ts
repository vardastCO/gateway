import { Field, InputType } from "@nestjs/graphql";
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from "class-validator"
import { AttributeValueTempDTO } from "./create-attribuite-value-temporary.input";


@InputType()
export class CreateAttribuiteTemporaryInput {

  @Field(() => [AttributeValueTempDTO])
  @IsArray()
  @IsNotEmpty()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  attributes: AttributeValueTempDTO[];
}
