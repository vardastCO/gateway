import { registerEnumType } from "@nestjs/graphql";

export enum ProvinceTypes {
  TEHRAN = 12,
}

registerEnumType(ProvinceTypes, {
  name: "ProvinceTypes",
});
