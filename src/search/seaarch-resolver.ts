// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { SearchService } from './search.service';
import { Public } from "src/users/auth/decorators/public.decorator";
import { SuggestInput } from "./dto/suggest.input";
import { SuggestResponse } from "./dto/suggest.response";
import { FilterableAttributesInput } from './dto/filterable-attributes.input';
import { FilterableAttributesResponse } from './dto/filterable-attributes.response';


@Resolver(() => Boolean)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}
  @Public()
  @Query(() => SuggestResponse, { name: "suggest" })
  suggest(
    @Args("suggestInput")
    suggestInput?: SuggestInput,
  ) {
    return this.searchService.suggest(suggestInput);
  }


  @Public()
  @Query(() => FilterableAttributesResponse, { name: "filterableAttributes" })
  filters(
    @Args("filterableAttributesInput")
    filterableAttributes?: FilterableAttributesInput,
  ) {
    return this.searchService.filters(filterableAttributes);
  }

  @Public()
  @Query(() => FilterableAttributesResponse, { name: "filtersBySimilarProductName" })
  filtersBySimilarProductName(
    @Args("name")
    name?: String,
  ) {
    return this.searchService.filtersBySimilarProductName(name);
  }

}
