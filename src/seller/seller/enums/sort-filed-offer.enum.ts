import { registerEnumType } from "@nestjs/graphql";

export enum SortFieldOffer {
  PRICE = 'last_price',
  TIME = 'last_price_date',
}

registerEnumType(SortFieldOffer, {
  name: "SortFieldOffer",
});
