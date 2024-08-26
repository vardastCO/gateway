import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SuggestInput } from './dto/suggest.input';
import { SuggestResponse } from './dto/suggest.response';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { ProductDTO } from 'src/product/product/dto/productDTO';
import { CategoryDTO } from 'src/product/category/dto/categoryDto';
import { brandDto } from 'src/product/brand/dto/brandDto';
import { SellerDTO } from 'src/seller/seller/dto/sellerDTO';
import { FilterableAttributesInput } from './dto/filterable-attributes.input';
import { FilterableAttributesResponse } from './dto/filterable-attributes.response';
import { AttributeDto } from 'src/product/attribute/dto/attributeDto';
@Injectable()
export class SearchService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }


     async suggest(suggestInput: SuggestInput): Promise<SuggestResponse> {
      const cacheKey = `suggest_${JSON.stringify(suggestInput)}`;

      const cachedData = await this.cacheManager.get<string>(cacheKey);
      
      if (cachedData) {
          const decompressedData : SuggestResponse = 
          this.decompressionService.decompressData(cachedData);
      
          return decompressedData;
  
      }

      const [products, categories,brands,sellers] = await Promise.all([
        this.getFindProductWithQuery(suggestInput),
        this.getFindCategoryWithQuery(suggestInput),
        this.getFindBrandWithQuery(suggestInput),
        this.getFindSellerWithQuery(suggestInput),
      ]);

      const response: SuggestResponse = {
          products: products as ProductDTO[],
          categories: categories as CategoryDTO[],
          seller: sellers as SellerDTO[],
          brand: brands as brandDto[],
      };
      await this.cacheManager.set(cacheKey, this.compressionService.compressData(response),CacheTTL.ONE_WEEK);
      return response;
    }
  async getFindProductWithQuery(query: any) : Promise<ProductDTO[]> {

    const cacheKey = `getFindProductWithQuery_${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedData) {
        const decompressedData : ProductDTO[] = 
        this.decompressionService.decompressData(cachedData);
    
        return decompressedData;

    }
    const payload = { query };

    const compressedPayload = this.compressionService.compressData(payload);
    let result = await this.rabbitMQService.send('search_products', { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_WEEK);

    const decompressedResult : ProductDTO[] = this.decompressionService.decompressData(result);

   
    return decompressedResult;
  }
  async getFindBrandWithQuery(query: any) : Promise<brandDto[]> {

    const cacheKey = `getFindBrandsWithQuery_${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedData) {
        const decompressedData : brandDto[] = 
        this.decompressionService.decompressData(cachedData);
    
        return decompressedData;

    }
    const payload = { query };

    const compressedPayload = this.compressionService.compressData(payload);
    let result = await this.rabbitMQService.send('search_brands', { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_WEEK);

    const decompressedResult : brandDto[] = this.decompressionService.decompressData(result);

   
    return decompressedResult;
  }
  
  async filtersBySimilarProductName(name: String): Promise<FilterableAttributesResponse> {
    const cacheKey = `filter_category_{name:${name}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {
        const decompressedData: FilterableAttributesResponse =
            this.decompressionService.decompressData(cachedData);

        return decompressedData;
    }

    const nameParts = name.split(' ');
    let res = [];


    for (let i = 0; i < nameParts.length; i++) {

        const sqlQuery = `
            SELECT * 
            FROM attributes_product_service AS po
            INNER JOIN category_filter AS pac 
                ON pac."attribuiteId" = po.id 
            INNER JOIN base_taxonomy_categories AS c
                ON pac."categoryId" = c.id
            WHERE c.title = '${nameParts[i]}'
        `;

        const result = await this.dataSource.query(sqlQuery);

        res = res.concat(result);


        if (result.length > 0) {
            break;
        }
    }

    if (res.length > 0) {
      
        const result = { filters: res };

        
        await this.cacheManager.set(
            cacheKey,
            this.compressionService.compressData(result),
            CacheTTL.ONE_WEEK
        );

        return result;
    } else {
        return { filters: [] };
    }
}

  async filters(
    filterInput: FilterableAttributesInput,
  ): Promise<FilterableAttributesResponse> {
    const { categoryId } = filterInput;
    const cacheKey = `filter_category_{id:${categoryId}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : FilterableAttributesResponse = 
      this.decompressionService.decompressData(cachedData);
  
      return decompressedData;

    }

    
    const sqlQuery = `
             
    SELECT * 
    FROM attributes_product_service po
    INNER JOIN category_filter  AS pac 
    ON pac."attribuiteId" = po.id 
    WHERE "categoryId" = ${categoryId};
  `;
  const res = await this.dataSource.query(sqlQuery)

    const result = {
      filters: res, 
    };
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(result), CacheTTL.ONE_WEEK);
    return result;
  }


  async getFindSellerWithQuery(query: any) : Promise<SellerDTO[]> {

    const cacheKey = `getFindSellerWithQuery_${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedData) {
        const decompressedData : SellerDTO[] = 
        this.decompressionService.decompressData(cachedData);
    
        return decompressedData;

    }
    const payload = { query };

    const compressedPayload = this.compressionService.compressData(payload);
    let result = await this.rabbitSellersService.send('search_sellers', { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_WEEK);

    const decompressedResult : SellerDTO[] = this.decompressionService.decompressData(result);

   
    return decompressedResult;
  }
  async getFindCategoryWithQuery(query: any) : Promise<CategoryDTO[]> {

    const cacheKey = `getFindCategoryWithQuery_${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedData) {
        const decompressedData : CategoryDTO[] = 
        this.decompressionService.decompressData(cachedData);
    
        return decompressedData;

    }
    const payload = { query };

    const compressedPayload = this.compressionService.compressData(payload);
    let result = await this.rabbitMQService.send('search_category', { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_WEEK);

    const decompressedResult : CategoryDTO[] = this.decompressionService.decompressData(result);

   
    return decompressedResult;
  }
    
}
