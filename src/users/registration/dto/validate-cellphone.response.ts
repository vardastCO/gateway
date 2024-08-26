import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AuthStates } from "../enums/auth-states.enum";

@ObjectType()
export class ValidateCellphoneResponse {
  @Field(() => AuthStates)
  nextState: AuthStates;

  @Field()
  message: string;

  @Field({ nullable: true })
  validationKey?: string;
}
