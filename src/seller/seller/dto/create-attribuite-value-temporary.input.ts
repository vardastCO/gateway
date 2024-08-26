import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
} from "class-validator"



@InputType()
export class AttributeValueTempDTO {
  @Field()
  @IsNotEmpty()
  attribuite: string;

  @Field()
  @IsNotEmpty()
  value: string;
}
