import { ClientProxy } from '@nestjs/microservices';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { CreateOptionInput } from './dto/create-options.input';
@Injectable()
export class OptionService {
  private productService: ClientProxy;

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createOptionDto: CreateOptionInput): Promise<boolean> {

    try {
      const pattern = 'create_option_automatic';
      const payload = { createOptionDto };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
      return result ;
    } catch (error) {
      console.log('e create_option_automatic ',error)
       return false
    }

  }

  async delete(id: number): Promise<boolean> {

    try {
      const pattern = 'remove_option';
      const payload = { id };
      const compressedPayload = this.compressionService.compressData(payload);
      
      this.rabbitMQService.send(pattern, { data: compressedPayload });
    } catch (error) {
       return false
    }

  }
}
