import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { SellerService } from './seller.service';
import { SellerDTO } from './dto/sellerDTO';
import { Permission } from "src/users/authorization/permission.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from 'src/users/user/entities/user.entity';
import { BecomeASellerInput } from './dto/become-a-seller.input';
import { IndexSellerRepresentativeInput } from './dto/index-seller-representative.input';
import { SellerStats } from './dto/profile-seller.response';
import { OfferDTO } from './dto/offerDTO';
import { CreateOfferInput } from './dto/create-offer.input';
import { PaginationSellerResponse } from './dto/pagination-seller.response';
import { IndexSellerInput } from './dto/index-seller.input';
import { ValidationPipe } from "@nestjs/common";
import { IndexMyofferInput } from './dto/index-my-offer.input';
import { PaginationMyOfferResponse } from './dto/pagination-my-offer.response';
import { UpdateSellerInput } from './dto/update-seller.input';
import { CreateProductTemporaryInput } from './dto/create-product-temporary.input';
import { ProductTemporaryDTO } from './dto/Product-temporary-DTO';
import { Public } from 'src/base/public.decorator';
import { PaginationTempResponse } from './dto/pagination-temp.response';
import { IndexTempInput } from './dto/index-temp.input';
import { CreateSellerFileInput } from './dto/create-seller-file.input';
import { IndexPublicofferInput } from './dto/index-public-offer.input';
import { CreateProductTemporaryAttribuiteInput } from './dto/create-product-temporary-attribuite.input';
import { CreateProductTemporaryfileInput } from './dto/create-product-temporary-file.input';
@Resolver(() => SellerDTO)
export class SellerResolver {
  constructor(private readonly sellerService : SellerService) {}


  @Permission("gql.products.seller.moderated_create")
  @Mutation(() => SellerDTO)
  becomeASeller(
    @Args("becomeASellerInput") becomeASellerInput: BecomeASellerInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.becomeASeller(becomeASellerInput, user);
  }

  @Permission("gql.products.seller.update")
  @Mutation(() => SellerDTO)
  updateSeller(
    @Args("updateSellerInput") updateSellerInput: UpdateSellerInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.update(
      updateSellerInput,
      user
    );
  }

  @Public()
  @Query(() => SellerDTO, { name: "seller" })
  findOne(@Args("id", { type: () => Int, nullable: true }) id: number) {
    return this.sellerService.findOne(id);
  }
  @Permission("gql.products.seller.update")
  @Mutation(() => ProductTemporaryDTO)
  addTemporaryProduct(
    @Args("createProductTemporaryInput") createProductTemporaryInput: CreateProductTemporaryInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.addTemporaryProduct(
      createProductTemporaryInput,
      user
    );
  }

  
  @Permission("gql.products.seller.update")
  @Mutation(() => Boolean)
  addTemporaryAtribuiteProduct(
    @Args("createProductTemporaryAttribuiteInput") createProductTemporaryAttribuiteInput: CreateProductTemporaryAttribuiteInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.addTemporaryAtribuiteProduct(
      createProductTemporaryAttribuiteInput,
      user
    );
  }

  @Permission("gql.products.seller.update")
  @Mutation(() => Boolean)
  addTemporaryFileProduct(
    @Args("createProductTemporaryfileInput") createProductTemporaryfileInput: CreateProductTemporaryfileInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.addTemporaryFileProduct(
      createProductTemporaryfileInput,
      user
    );
  }

  // @Permission("gql.products.seller.update")
  // @Mutation(() => ProductTemporaryDTO)
  // addTemporaryAttribuite(
  //   @Args("createProductTemporaryInput") createProductTemporaryInput: CreateProductTemporaryInput,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.sellerService.addTemporaryAttribuite(
  //     createProductTemporaryInput,
  //     user
  //   );
  // }

  @Permission("gql.products.offer.store.mine")
  @Mutation(() => OfferDTO)
  createOffer(
    @Args("createOfferInput") createOfferInput: CreateOfferInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.create(createOfferInput, user);
  }

  @Permission("gql.products.offer.store.mine")
  @Mutation(() => PaginationMyOfferResponse)
  myOffer(
    @Args('indexMyofferInput', { type: () => IndexMyofferInput, nullable: true }, new ValidationPipe({ transform: true }))
    indexMyofferInput: IndexMyofferInput,
    @CurrentUser() user: User,
  ): Promise<PaginationMyOfferResponse> {
    return this.sellerService.my_offer(indexMyofferInput, user);
  }

  @Permission("gql.products.offer.destroy")
  @Mutation(() => Boolean)
  removeOffer(
    @Args("offerId", { type: () => Int, nullable: true }) offerId: number | null,
    @CurrentUser() user: User) {
    
    return this.sellerService.remove_offer(user,offerId);
  }

  @Public()
  @Query(() => PaginationSellerResponse, { name: "sellers" })
  findAll(
    @CurrentUser() user: User,
    @Args(
      "indexSellerInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerInput?: IndexSellerInput,
  ) {
    return this.sellerService.paginate(user, indexSellerInput);
  }

  @Mutation(() => Boolean)
  updateSellerFile(
    @Args("createSellerFileInput") createSellerFileInput: CreateSellerFileInput,
  ) {
    return this.sellerService.updateSellerFile(createSellerFileInput);
  }

  @Public()
  @Mutation(() => Boolean, { name: 'removeSellerFile' })
  removeSellerFile(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<Boolean> {
    return this.sellerService.removeSellerFile(id);
  }

  @Permission("gql.products.seller.moderated_create")
  @Mutation(() => PaginationTempResponse)
  tempProducts(
    @CurrentUser() user: User,
    @Args(
      "indexTempInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexTempInput?: IndexTempInput,
  ) {
    return this.sellerService.tempProduct(indexTempInput);
  }

  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => Boolean)
  removeTemp(
    @Args("id") id: number,
    @CurrentUser() user: User
  ) {
    return this.sellerService.removeTemp(id);
  }
  

  @Public()
  @Query(() => ProductTemporaryDTO)
  findOneTemp(
    @Args("id", {type: () => Int}) id: number
  ) : Promise<ProductTemporaryDTO> {
    return this.sellerService.findOneTemp(id)
  }

  @Permission("gql.products.product.index")
  @Query(() => SellerStats, { name: "myProfileSeller" })
  myProfileSeller(
    @Args("searchSellerRepresentativeInput")
    indexSellerRepresentativeInput: IndexSellerRepresentativeInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.myProfileSeller(
      user.id
    );
  }

  @Public()
  @Query(() => PaginationMyOfferResponse, { name: "productOffers" })
  productOffers(
    @Args(
      "indexPublicofferInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPublicofferInput?: IndexPublicofferInput,

  ) {
    return this.sellerService.productOffers(
      indexPublicofferInput
    );
  }
}
