// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { BrandService } from './brand.service';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { IndexBrandInput } from './dto/index-brand.input';
import { brandDto } from './dto/brandDto';
import { PaginationBrandResponse } from './dto/pagination-brand.response';
import { CreateBrandInput } from './dto/create-brand.input';
import { CreateBrandFileInput } from './dto/create-brand-file.input';
import { BrandTypeEnum } from './enums/brnad-type.enum';
import { IndexSingleBrandInput } from './dto/index-single-brand.input';
import { Permission } from "src/users/authorization/permission.decorator";
import { UpdateBrandInput } from './dto/update-brand.input';
@Resolver(() => brandDto)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  @Public()
  @Query(() => PaginationBrandResponse, { name: 'brands' })
  paginate
    ( 
      @Args('indexBrandInput', { type: () => IndexBrandInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexBrandInput: IndexBrandInput,
    ) : Promise<PaginationBrandResponse>  {

    return this.brandService.paginate(indexBrandInput);
  }

  @Public()
  @Query(() => [brandDto], { name: 'filterBrandByCategoryWithoutPaginations' })
  filterBrandByCategoryWithoutPaginations
    ( 
      @Args("categoryId", { type: () => Int }) categoryId: number
    ) : Promise<brandDto[]>  {

    return this.brandService.filterBrandByCategoryWithoutPaginations(categoryId);
  }

  @Mutation(() => brandDto)
  createBrand(
    @Args("createBrandInput") createBrandInput: CreateBrandInput,
  ) {
    return this.brandService.create(createBrandInput);
  }

  @Mutation(() => Boolean)
  updateBrandFile(
    @Args("createBrandFileInput") createBrandFileInput: CreateBrandFileInput,
  ) {
    return this.brandService.updateBrandFile(createBrandFileInput);
  }

  @Permission("gql.products.brand.update")
  @Mutation(() => brandDto)
  updateBrand(
    @Args("updateBrandInput") updateBrandInput: UpdateBrandInput,
  ) {
    return this.brandService.update(
      updateBrandInput.id,
      updateBrandInput,
    );
  }

  

  @Public()
  @Query(() => brandDto, { name: 'brand' })
  findOne(
    @Args("IndexSingleBrandInput") indexSingleBrandInput: IndexSingleBrandInput,
  ) : Promise<brandDto> {
    return this.brandService.findOne(indexSingleBrandInput.id,indexSingleBrandInput.type)
  }

  @Public()
  @Mutation(() => Boolean, { name: 'removeBrandFile' })
  removeBrandFile(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<Boolean> {
    return this.brandService.removeBrandFile(id);
  }

  @Public()
  @Mutation(() => Boolean, { name: 'removeBrand' })
  remove(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<Boolean> {
    return this.brandService.remove(id);
  }
}
