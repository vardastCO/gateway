import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { User } from "src/users/user/entities/user.entity";
import { UserService } from "src/users/user/user.service";
import { DataSource, EntityManager, In } from "typeorm";
import { AuthorizationService } from "../../users/authorization/authorization.service";
import { IndexMyofferInput } from "../seller/dto/index-my-offer.input";
import { PaginationMyOfferResponse } from "../seller/dto/pagination-my-offer.response";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { OfferDTO } from "../seller/dto/offerDTO";


@Injectable()
export class OfferService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService, 
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async paginate(
    user: User,
    indexOfferInput?: IndexMyofferInput,
  ): Promise<PaginationMyOfferResponse> {
    indexOfferInput.boot();

    const cacheKey = `offers_{productId:${indexOfferInput}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
  
      return this.decompressionService.decompressData(cachedData);

    }
    const pattern = 'get_total_offers';
    
    const payload = { indexOfferInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });

    const decompressedResultData = this.decompressionService.decompressData(result)

    const productIds = await this.extractProductIds(decompressedResultData[0]);

    const promises = [
      this.getproductData(productIds),
    ];

    const [productsData] = await Promise.all(promises);
    let decompressedProducttData = this.decompressionService.decompressData(productsData)

    const offers = Promise.all(decompressedResultData[0].map(async (offer) => {
      const correspondingProduct = await decompressedProducttData.find(product => product.id === offer.productId) || null;
      return {
        ...offer,
        product: correspondingProduct,
      };
    }));
    
    
    const decompressedResult: PaginationMyOfferResponse =
    PaginationMyOfferResponse.make(indexOfferInput, decompressedResultData[1],await offers);
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(decompressedResult)
     ,CacheTTL.ONE_WEEK)
    ;
    return decompressedResult;
    
  }

  async findOne(
    id:number
  ): Promise<OfferDTO> {
  
    const cacheKey = `offer_{id:${id}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
  
      return this.decompressionService.decompressData(cachedData);

    }
    const pattern = 'get_single_offer';
    
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });

    const decompressedResultData = this.decompressionService.decompressData(result)

    const promises = [
      this.getproductData([decompressedResultData.productId]),
    ];
    
    const [productsData] = await Promise.all(promises);

    let decompressedProductData = await this.decompressionService.decompressData(productsData);

    decompressedProductData = decompressedProductData[0];

    decompressedResultData.product = decompressedProductData;

    await this.cacheManager.set(cacheKey, this.compressionService.compressData(await decompressedResultData)
     ,CacheTTL.ONE_WEEK)
    ;
    return await decompressedResultData;
    
  }
  private async getproductData(ids: number[]) {
    const cacheKey = `getproductData_{ids:${ids}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const payload = { ids };
    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitMQService.send('find_products_by_ids', { data: compressedPayload });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return response;
  }

  async extractProductIds(result: any): Promise<number[]> {
    return result.map(item => item.productId);
  }

}
