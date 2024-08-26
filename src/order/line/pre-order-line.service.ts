import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateLineInput } from './dto/create-pre-order.input';
import { User } from 'src/users/user/entities/user.entity';
import { RabbitOrdersService } from 'src/rabbit-order.service';
import { LineDTO } from './dto/lineDTO';

@Injectable()
export class PreOrderLineService {
  constructor( 
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rabbitOrdersService: RabbitOrdersService, 
    @InjectDataSource() private readonly dataSource: DataSource)
     
     { }

     async creatline(createLineInput: CreateLineInput,user:User): Promise<LineDTO> {
       
      try {
        const cacheKey = `line_pre_order_{id:${createLineInput.pre_order_id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }
      
        const pattern = 'create_line_order'
       
        const payload = { createLineInput,userId:user.id };
        const compressedPayload = this.compressionService.compressData(payload);
        
        const result = await this.rabbitOrdersService.send(pattern, { data: compressedPayload });
  
        const response =  this.decompressionService.decompressData(result);
  
        return response
      } catch (error) {

        console.log('create_line_order err',error)
        
      }
    
    }


    
}
