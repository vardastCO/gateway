import {  Injectable } from "@nestjs/common";
import { ChartInput } from "./dto/chart-input";
import { ChartOutput } from "./dto/chart-output";
import { ChartEnum } from "./enums/chart.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CreatePriceInput } from "./dto/create-price-input";
import { User } from "src/users/user/entities/user.entity";
import { SellerRepresentativeDTO } from "../seller/dto/SellerRepresentativeDTO";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
@Injectable()
export class PriceService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService, 
    private readonly rabbitSellersService: RabbitSellersService,  
  ){}
  getDateFromEnum(type: ChartEnum): Date | null {
    const currentDate = new Date();
    switch(type) {
      case ChartEnum.DAILY:
        return new Date(currentDate.setDate(currentDate.getDate() - 1))
      case ChartEnum.WEEKLY:
        return new Date(currentDate.setDate(currentDate.getDate() - 7));
      case ChartEnum.MONTHLY:
        return new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      case ChartEnum.YEARLY:
        return new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      default:
        return null; 
    }
  }
  async priceChart(chartInput: ChartInput): Promise<ChartOutput> {
    if (chartInput.type == ChartEnum.DAILY) {
      return { data: [], labels: [] };  
    }
    const { productId, type } = chartInput;
    const toDate = this.getDateFromEnum(type);

    const cacheKey = `chart_price_{ids:${productId},type:${type}}`;
    const cachedResult = await this.cacheManager.get<ChartOutput>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const query = `
      WITH min_prices AS (
          SELECT 
              date_trunc('day', "createdAt"::date) AS date,
              MIN(amount) AS min_amount
          FROM product_prices 
          WHERE "productId" = $1
          GROUP BY date_trunc('day', "createdAt"::date)
      )
      SELECT 
          price."createdAt" AS "date",
          price.amount 
      FROM product_prices price 
      JOIN min_prices ON date_trunc('day', price."createdAt"::date) = min_prices.date AND price.amount = min_prices.min_amount
      WHERE price."productId" = $1 
        AND price."createdAt" BETWEEN $2 and NOW();
    `

    const data = await this.dataSource.query(query, [productId, toDate]);
  
    const chartOutput =  data.reduce(
       (carry, current) => {
        carry.data.push(current.amount.toString());
        carry.labels.push(new Date(current.date).toISOString());
        return carry;
      },
      { data: [], labels: [] },
    );

    await this.cacheManager.set(cacheKey, chartOutput,CacheTTL.ONE_WEEK);

    return chartOutput;

  }

  async addPrice(createPriceInput: CreatePriceInput,user:User): Promise<boolean> {

    try {
    
      const sellerId = (await this.findSeller(user.id)).sellerId

      const pattern = 'add_price';
      
      const payload = { createPriceInput, userId:user.id,sellerId };

      const compressedPayload = this.compressionService.compressData(payload);

      const result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
      
      return result
    } catch(e) {
      console.log('add_price',e)
      return false
    }
  }

  async findSeller(userId: number): Promise<SellerRepresentativeDTO> {
    try {
      const cacheKey = `find_my_seller_{userId:${userId}}`;
      
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
    
        return this.decompressionService.decompressData(cachedData);

      }
      const pattern = 'find_seller';
      const payload = {userId};

      const compressedPayload = this.compressionService.compressData(payload);

      let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
      await this.cacheManager.set(cacheKey,this.compressionService.compressData(result),CacheTTL.ONE_MONTH);
      return result
    }catch(e){
      throw new Error(`Error in find_seller : ${e.message}`);
    }
  }

}
