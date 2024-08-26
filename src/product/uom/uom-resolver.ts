// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { UomService } from './uom.service';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { IndexUomInput } from './dto/index-uom.input';
import { UOMDto } from './dto/uomDto';
import { PaginationUomResponse } from './dto/pagination-uom.response';
import { UpdateUomInput } from './dto/update-uom.input';
import { Permission } from 'src/users/authorization/permission.decorator';
import { CreateUomInput } from './dto/create-uom.input';

@Resolver(() => UOMDto)
export class UomResolver {
  constructor(private readonly uomService: UomService) {}

  @Public()
  @Query(() => PaginationUomResponse, { name: 'uoms' })
  uoms
    ( 
      @Args('indexUomInput', { type: () => IndexUomInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexUomInput: IndexUomInput,
    ) : Promise<PaginationUomResponse>  {

    return this.uomService.getAllUOM(indexUomInput);
  }
  

  @Public()
  @Query(() => UOMDto, { name: 'uom' })
  findOne(
    @Args("id", {type: () => Int}) id: number
  ) : Promise<UOMDto> {
    return this.uomService.findOne(id)
  }

  @Public()
  @Mutation(() => UOMDto)
  updateUom(@Args("updateUomInput") updateUomInput: UpdateUomInput)  {
    return this.uomService.update(
      updateUomInput.id,
      updateUomInput,
    );
  }

  @Public()
  @Mutation(() => UOMDto, { name: 'removeUom' })
  remove(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<UOMDto> {
    return this.uomService.remove(id);
  }

  @Permission("gql.products.uom.store")
  @Mutation(() => UOMDto)
  createUom(@Args("createUomInput") createUomInput: CreateUomInput) {
    return this.uomService.create(createUomInput);
  }
}
