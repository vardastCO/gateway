import { registerEnumType } from "@nestjs/graphql";

export enum BlogTypeEnum {
    RESPONSE_TYPE_A =  4,
    RESPONSE_TYPE_B =  24,
    RESPONSE_TYPE_C =  5
}

registerEnumType(BlogTypeEnum, {
  name: "BlogTypeEnum",
});
