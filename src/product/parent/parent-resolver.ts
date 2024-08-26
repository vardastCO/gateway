// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { ParentProductDTO } from './dto/parentProductDTO';
import { ParentService } from './parent.service';
import { PaginationParentResponse } from './dto/pagination-parent.response';
import { IndexParentInput } from './dto/index-parent.input';

@Resolver(() => ParentProductDTO)
export class ParentResolver {
  constructor(private readonly parentService: ParentService) {}

  @Public()
  @Query(() => PaginationParentResponse, { name: 'getAllParent' })
  paginateParent
    ( 
      @Args('indexParentInput', { type: () => IndexParentInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexParentInput: IndexParentInput,
    ) : Promise<PaginationParentResponse[]>  {

    return this.parentService.pagination(indexParentInput);
  }
  

  @Public()
  @Query(() => ParentProductDTO, { name: 'parent' })
  findOneParent(
    @Args("id", {type: () => Int}) id: number
  ) : Promise<ParentProductDTO> {
    return this.parentService.findOne(id)
  }

  @Public()
  @Mutation(() => ParentProductDTO, { name: 'removeParent' })
  removeParent(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<ParentProductDTO> {
    return this.parentService.remove(id);
  }
}
