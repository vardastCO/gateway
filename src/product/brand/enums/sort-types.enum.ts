import { registerEnumType } from "@nestjs/graphql";

export enum SortFieldBrand {
  RATING = 'rating',
  MOST_PRODUCT = 'sum',
  NEWEST = 'createdAt',
}

registerEnumType(SortFieldBrand, {
  name: "SortFieldBrand",
});
