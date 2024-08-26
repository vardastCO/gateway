import { ClientProxy } from '@nestjs/microservices';
import { IndexUomInput } from './dto/index-uom.input';
import { PaginationUomResponse } from './dto/pagination-uom.response';
import { UOMDto } from './dto/uomDto';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { UpdateUomInput } from './dto/update-uom.input';
import { CreateUomInput } from './dto/create-uom.input';
@Injectable()
export class UomService {
  private productService: ClientProxy;

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}


  async getAllUOM(indexUomInput: IndexUomInput): Promise<PaginationUomResponse> {
    indexUomInput.boot();
    const cacheKey = `uoms_${JSON.stringify(indexUomInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : PaginationUomResponse = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'pagination_uoms';
    
    const payload = { indexUomInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.THREE_DAYS);

    const decompressedResult : PaginationUomResponse = 
    this.decompressionService.decompressData(result)
    ;
   
    return decompressedResult;
    
  }
  async update(id: number, updateUomInput: UpdateUomInput): Promise<UOMDto> {
    const pattern = 'update_uom' ;
    const payload = { updateUomInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    
    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;
  }

  async findOne(id: number, slug?: string): Promise<UOMDto>{
    const cacheKey = `brand_{id:${id}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : UOMDto = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;
    }
    const pattern = 'find_one_uom' ;
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.THREE_DAYS);
    
    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;
  }
  async create(createUomInput: CreateUomInput): Promise<UOMDto> {
    const pattern = 'create_uom' ;
    const payload = { createUomInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    
    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;
  }

  async remove(id: number): Promise<UOMDto>{
    const pattern = { cmd: 'remove_uom' };
    const payload = { id };
    let result = await this.productService.send(pattern, payload).toPromise();

    return JSON.parse(result);
  }
}
