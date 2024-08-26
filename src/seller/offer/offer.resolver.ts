import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission.decorator";
import { OfferService } from "./offer.service";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "src/users/user/entities/user.entity";
import { OfferDTO } from "../seller/dto/offerDTO";
import { PaginationMyOfferResponse } from "../seller/dto/pagination-my-offer.response";
import { IndexMyofferInput } from "../seller/dto/index-my-offer.input";
@Resolver(() => OfferDTO)
export class OfferResolver {
  constructor(private readonly offerService: OfferService) {}

  

  @Permission("gql.products.offer.index.mine")
  @Query(() => PaginationMyOfferResponse, { name: "offers" })
  findAll(
    @CurrentUser() user: User,
    @Args(
      "indexOfferInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexOfferInput?: IndexMyofferInput,
  ) {
    return this.offerService.paginate(user, indexOfferInput);
  }



  @Permission("gql.products.offer.show.mine")
  @Query(() => OfferDTO, { name: "offer" })
  findOne(
    @Args("id", { type: () => Int }) id: number,
  ) {
    return this.offerService.findOne(id);
  }

  
}
