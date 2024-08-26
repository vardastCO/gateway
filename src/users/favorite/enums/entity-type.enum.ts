import { registerEnumType } from "@nestjs/graphql";

export enum EntityTypeEnum {
  BRAND   = "BRAND",
  SELLER  = "SELLER",
  PRODUCT = "PRODUCT",
  CART    = "CART"
}

registerEnumType(EntityTypeEnum, { name: "EntityTypeEnum" });
