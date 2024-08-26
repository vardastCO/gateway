import { registerEnumType } from "@nestjs/graphql";

export enum SortField {
  TITLE = 'title',
  PRODUCT_COUNT = 'productCount',
  STATUS = 'status',
}

registerEnumType(SortField, {
  name: "SortField",
});
