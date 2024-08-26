// favorite.resolver.ts
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "../user/entities/user.entity";
import { EntityResponse } from "./dto/entity.response";
import { UpdateFavoriteInput } from "./dto/favorite.update.input";
import { Favorite } from "./entities/favorite.entity";
import { FavoriteService } from "./favorite.service";
import { EntityTypeInput } from "./dto/favorites.input";
import { ValidationPipe } from "@nestjs/common";
import { EntityTypeEnum } from "./enums/entity-type.enum";
import { ProductDTO } from "src/product/product/dto/productDTO";
import { brandDto } from "src/product/brand/dto/brandDto";
import { SellerDTO } from "src/seller/seller/dto/sellerDTO";
import { Public } from "src/users/auth/decorators/public.decorator";
import { UpdatePromoteInput } from "./dto/promote.update.input";
import { RemovePromoteInput } from "./dto/promote.remove.input";
@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Query(() => EntityResponse, { name: "favorites" })
  async favorites(
    @Args(
      "favoritesInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    favoritesInput: EntityTypeInput,
    @CurrentUser() currentUser: User,
  ): Promise<EntityResponse> {
    const data : ProductDTO[] | brandDto[] | SellerDTO[] = await this.favoriteService.findFavorites(
      favoritesInput.type,
      currentUser,
    );
    let responseData: { [key: string]: ProductDTO[] | brandDto[] | SellerDTO[]  } = {};

    if (favoritesInput.type === EntityTypeEnum.PRODUCT) {
      responseData = { product: data , seller:[] , brand:[]};
    } else if (favoritesInput.type === EntityTypeEnum.CART) {
      responseData = { product: data , seller:[],brand:[] };
    }  
    else if (favoritesInput.type === EntityTypeEnum.SELLER) {
      responseData = { seller: data , product:[],brand:[] };
    } else if (favoritesInput.type === EntityTypeEnum.BRAND) {
      responseData = { brand: data,seller:[],product:[] };
    }
  
    return responseData as EntityResponse;
  }

  @Query(() => Boolean, { name: "isFavorite" })
  async isFavorite(
    @Args("updateFavoriteInput") updateFavoriteInput: UpdateFavoriteInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    return this.favoriteService.isFavorite(
      currentUser.id,
      updateFavoriteInput.entityId,
      updateFavoriteInput.type,
    );
  }

  @Public()
  @Query(() => EntityResponse, { name: "promotedItems" })
  async promotedItems(
    @Args("entityTypeInput")
    entityTypeInput?: EntityTypeInput,
  ) {

    const data : ProductDTO[] | brandDto[] | SellerDTO[] = await this.favoriteService.promotedItems(
      entityTypeInput.type,
    );
    let responseData: { [key: string]: ProductDTO[] | brandDto[] | SellerDTO[]  } = {};

    if (entityTypeInput.type === EntityTypeEnum.PRODUCT) {
      responseData = { product: data , seller:[] , brand:[]};
    } else if (entityTypeInput.type === EntityTypeEnum.SELLER) {
      responseData = { seller: data , product:[],brand:[] };
    } else if (entityTypeInput.type === EntityTypeEnum.BRAND) {
      responseData = { brand: data,seller:[],product:[] };
    }
  
    return responseData as EntityResponse;
  }
  @Mutation(() => Boolean, { name: "addPromote" })
  async addPromote(
    @Args(
      "updatePromoteInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    updatePromoteInput: UpdatePromoteInput,
  ): Promise<boolean> {
    try {
      const result = await this.favoriteService.updatePromote(
        updatePromoteInput.entityId,
        updatePromoteInput.type,
      );
  
      return !!result;
    } catch (err) {
      console.log('errro in updateFavorite',err)
    }
    
  }
  @Mutation(() => Boolean, { name: "removePromote" })
  async removePromote(
    @Args(
      "removePromoteInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    removePromoteInput: RemovePromoteInput,
  ): Promise<boolean> {
    try {
      const result = await this.favoriteService.removePromote(
        removePromoteInput.entityId,
        removePromoteInput.type,
      );
  
      return !!result;
    } catch (err) {
      console.log('errro in updateFavorite',err)
    }
    
  }
  @Mutation(() => Boolean, { name: "updateFavorite" })
  async updateFavorite(
    @Args(
      "updateFavoriteInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    updateFavoriteInput: UpdateFavoriteInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    try {
      const result = await this.favoriteService.updateFavorite(
        currentUser,
        updateFavoriteInput.entityId,
        updateFavoriteInput.type,
      );
  
      return !!result;
    } catch (err) {
      console.log('errro in updateFavorite',err)
    }
    
  }
}
