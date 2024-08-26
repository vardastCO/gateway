import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsInt, ValidateIf, IsOptional,IsArray  } from "class-validator";



@InputType()
export class CreateOptionInput {
  @Field()
  @IsInt()
  @IsNotEmpty()
  attribuiteId: number;

  @Field(() => [Number])
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  valueIds: number[]; 


  @Field()
  @IsNotEmpty()
  @ValidateIf((object, value) => value === undefined)
  productId: number;

  @ValidateIf((object) => object.parentProductId === undefined && object.productId === undefined)
  validateOneNotEmpty() {
    throw new Error('At least one of parentProductId or productId should not be empty');
  }

}
