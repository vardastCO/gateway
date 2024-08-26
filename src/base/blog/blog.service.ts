// blog.service.ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { IndexBlogInput } from "./dto/IndexBlogInput";
import { PaginationBlogResponse } from "./dto/PaginationBlogResponse";
import { Blog } from "./entities/blog.entity";
import * as zlib from 'zlib';
import { BlogTypeEnum } from "./enums/blog-type.enum";
@Injectable()
export class BlogService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getAllBlogs(
    indexBlogInput?: IndexBlogInput,
  ): Promise<PaginationBlogResponse> {
    try {
      const cacheKey = `blogs_${JSON.stringify(indexBlogInput)}`;
      const cachedData = await this.cacheManager.get<string>(
        cacheKey,
      );

      if (cachedData) {
    
        const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
        const parsedData: PaginationBlogResponse = JSON.parse(decompressedData);
        return parsedData;
      }

      const queries = [
        Blog.find({ where: { categoryId: BlogTypeEnum.RESPONSE_TYPE_A }, take: 1 }),
        Blog.find({ where: { categoryId: BlogTypeEnum.RESPONSE_TYPE_B  }, take: 1 }),
        Blog.find({ where: { categoryId: BlogTypeEnum.RESPONSE_TYPE_C  }, take: 3 })
    ];
      const [blogsCategory4, blogsCategory5, blogsCategory24] = await Promise.all(queries);

      const mergedBlogs = [...blogsCategory4, ...blogsCategory5, ...blogsCategory24];

      const result: PaginationBlogResponse = PaginationBlogResponse.make(
        indexBlogInput,
        5,
        mergedBlogs,
      );
      
      const compressedData = zlib.gzipSync(JSON.stringify(result));

      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.SIX_HOURS);

      return result;
    } catch (e) {
      console.log("getAllBlogs ERROR ", e);
    }
  }

}
