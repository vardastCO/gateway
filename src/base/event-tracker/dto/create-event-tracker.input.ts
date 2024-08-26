import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString,IsEnum } from "class-validator";
import { EventTrackerSubjectTypes } from "../enums/event-tracker-subject-types.enum";
import { EventTrackerTypes } from "../enums/event-tracker-types.enum";

@InputType()
export class CreateEventTrackerInput {

  @Field(() => EventTrackerTypes, {
    nullable: true,
    defaultValue: EventTrackerTypes.SELLER,
  })
  @IsOptional()
  @IsEnum(EventTrackerTypes)
  type: EventTrackerTypes;


  @Field(() => EventTrackerSubjectTypes, {
    nullable: true,
    defaultValue: EventTrackerSubjectTypes.CONTACT_INFO,
  })
  @IsOptional()
  @IsEnum(EventTrackerSubjectTypes)
  subjectType: EventTrackerSubjectTypes;

  @Field(() => Int)
  @IsNotEmpty()
  subjectId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  url: string;

  userId: number;
  agent: string;
  ipAddress: string;
}
