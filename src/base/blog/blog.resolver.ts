// blog.resolver.ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
} from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { Cache } from "cache-manager";
import { Public } from "src/users/auth/decorators/public.decorator";
import { BlogService } from './blog.service';
import { IndexBlogInput } from "./dto/IndexBlogInput";
import { PaginationBlogResponse } from "./dto/PaginationBlogResponse";
import { Blog } from "./entities/blog.entity";



@Resolver(() => Blog)
export class BlogResolver {
  constructor( @Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly blogService: BlogService) { }


  @Public()
  @Query(() => PaginationBlogResponse)
  async blogs(
    @Args("indexBlogInput") indexBlogInput?: IndexBlogInput,
  ): Promise<PaginationBlogResponse> {
    return this.blogService.getAllBlogs(indexBlogInput);
  }


}
