import { Field, InputType, Int } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

@InputType()
export class ProductTemporaryInput {

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  length?: string;

  @Field({ nullable: true })
  width?: string;

  @Field({ nullable: true })
  height?: string;

  @Field({ nullable: true })
  weight?: string;

  @Field(() => ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;
}
