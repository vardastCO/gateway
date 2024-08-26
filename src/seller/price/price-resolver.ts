import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PriceService } from './price.service';
import { HighestPriceDTO } from './dto/highestPriceDTO';
import { Public } from "src/users/auth/decorators/public.decorator";
import { ChartOutput } from "./dto/chart-output";
import { ChartInput } from './dto/chart-input';
import { Permission } from "src/users/authorization/permission.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { CreatePriceInput } from './dto/create-price-input';
import { User } from 'src/users/user/entities/user.entity';
import { ValidationPipe } from "@nestjs/common";
@Resolver(() => HighestPriceDTO)
export class PriceResolver {
  constructor(private readonly priceService : PriceService) {}

  @Public()
  @Query(() => ChartOutput, { name: "priceChart" })
  priceChart(@Args("chartInput") chartInput: ChartInput) {
    return this.priceService.priceChart(chartInput)
  }

  @Public()
  @Query(() => String, { name: "calculatePrice" })
  calculatePrice(@Args("orginalAmount") amount: string,@Args("valueDiscount") valueDiscount: string,
  @Args("typeDiscount") typeDiscount: string
  ) {
    return Math.floor((Number(amount) * ((100 - Number(valueDiscount))/100))).toString();
  }

  @Permission("gql.products.offer.store.mine")
  @Mutation(() => Boolean)
  addPrice(
    @Args('createPriceInput', { type: () => CreatePriceInput, nullable: true }, new ValidationPipe({ transform: true }))
    createPriceInput: CreatePriceInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.priceService.addPrice(createPriceInput, user);
  }

}
