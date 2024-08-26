import { registerEnumType } from "@nestjs/graphql";

export enum RoleTypes {
  USER = 1,
}

registerEnumType(RoleTypes, { name: "RoleTypes" });
