import { registerEnumType } from "@nestjs/graphql";

export enum EventTrackerTypes {
  SELLER = 1,
  BRAND = 2,
  PRODUCT = 3,
}

registerEnumType(EventTrackerTypes, { name: "EventTrackerTypes" });
