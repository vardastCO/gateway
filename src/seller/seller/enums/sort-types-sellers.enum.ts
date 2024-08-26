import { registerEnumType } from "@nestjs/graphql";

export enum SortFieldSeller{
  RATING = 'rating',
  CREATED = 'createdAt',
  PRODUCT = 'sum',
  STATUS = 'status',
}

registerEnumType(SortFieldSeller, {
  name: "SortFieldSeller",
});
