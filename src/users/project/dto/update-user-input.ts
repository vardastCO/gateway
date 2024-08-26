import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import {
    IsInt,
    IsNotEmpty,
    IsOptional
} from "class-validator";
import { CreateUserProjectInput } from "./create-user-project.input";



@InputType()
export class UpdateProjectUserInput extends PartialType(CreateUserProjectInput) {
    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    projectId: number;

    @Field(() => Int)
    @IsNotEmpty()
    @IsInt()
    userId: number;
}


