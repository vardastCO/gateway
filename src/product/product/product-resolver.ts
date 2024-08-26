import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { ParentProductDTO } from '../parent/dto/parentProductDTO';
import { IndexParentInput } from '../parent/dto/index-parent.input';
import { ProductService } from './product.service';
import { ProductDTO } from './dto/productDTO';
import { PaginationProductResponse } from './dto/pagination-product.response';
import { IndexProductInput } from './dto/index-product.input';
import { Permission } from "src/users/authorization/permission.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from 'src/users/user/entities/user.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { IsCacheEnabled } from 'src/base/cache.decorator';
@Resolver(() => ParentProductDTO)
export class ProductResolver {
  constructor(private readonly productService : ProductService) {}

  @Public()
  @Query(() => PaginationProductResponse, { name: 'products' })
  paginateProduct
    ( 
      @Args('indexProductInput', { type: () => IndexProductInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexProductInput: IndexProductInput,
      @CurrentUser() user?: User,  
    ) : Promise<PaginationProductResponse>  {

    return this.productService.pagination(indexProductInput,user);
  }

  @Permission("gql.products.product.store")
  @Mutation(() => ProductDTO)
  createProduct(
    @Args("createProductInput") createProductInput: CreateProductInput,
    @CurrentUser() user: User,
  ) {
    return this.productService.create(createProductInput, user);
  }

  @Public()
  @Query(() => ProductDTO, { name: 'product' })
  findOneProduct(
    @Args("id", {type: () => Int}) id: number,
    @IsCacheEnabled() isCacheEnabled: boolean, 
  ) : Promise<ProductDTO> {
    return this.productService.findOne(id,isCacheEnabled)
  }

  @Public()
  @Query(() => [ProductDTO], { name: 'similarproduct' })
  similarproduct(
    @Args("id", {type: () => Int}) id: number
  ): Promise<ProductDTO[]>  {
    return this.productService.similarproduct(id);
  } 

  @Public()
  @Mutation(() => Boolean, { name: 'removeProduct' })
  removeProduct(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<boolean> {
    return this.productService.remove(id);
  }

  @Permission("gql.products.product.update")
  @Mutation(() => ProductDTO, { name: 'createVarientFromExistProduct' })
  createVarientFromExistProduct(
    @Args("orginal_produtc_id", { type: () => Int }) orginal_produtc_id: number,
    @Args("similar_produtc_id", { type: () => Int }) similar_produtc_id: number,
    @Args("attribuite_id", { type: () => Int }) attribuite_id: number,
    @Args("similar_value_id", { type: () => Int }) similar_value_id: number,
    @Args("orginal_value_id", { type: () => Int }) orginal_value_id: number,
  ) : Promise<ProductDTO> {
    return this.productService.createVarientFromExistProduct(
      orginal_produtc_id,
      similar_produtc_id,
      attribuite_id,
      similar_value_id,
      orginal_value_id
    );
  }

  @Permission("gql.products.product.update")
  @Mutation(() => ProductDTO)
  updateProduct(
    @Args("updateProductInput") updateProductInput: UpdateProductInput,
  ) {
    return this.productService.update(
      updateProductInput.id,
      updateProductInput,
    );
  }

}
