import { registerEnumType } from "@nestjs/graphql";

export enum ContryTypes {
  IRAN = 244,
}

registerEnumType(ContryTypes, {
  name: "ContryTypes",
});
