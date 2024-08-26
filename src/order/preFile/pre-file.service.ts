import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AddFilePreOrderInput } from './dto/add-pre-order-file.input';
import { User } from 'src/users/user/entities/user.entity';
import { RabbitOrdersService } from 'src/rabbit-order.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';

@Injectable()
export class PreFileService {
  constructor( 
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rabbitOrdersService: RabbitOrdersService, 
    private readonly rabbitAssetsService: RabbitAssetsService, 
    @InjectDataSource() private readonly dataSource: DataSource)
     { }
     
     async removeFilePreOrder( id: number,user:User): Promise<Boolean> {
    
      try {
        const cacheKey = `file_pre_order_{id:${id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }
        const pattern = 'remove_file_order'
       
        const payload = { id,userId:user.id };
        const compressedPayload = this.compressionService.compressData(payload);
        
         this.rabbitAssetsService.send(pattern, { data: compressedPayload });
  

        return true
      } catch (error) {

        console.log('add File Pre Order err',error)
        return false
        
      }   
    
      }
     async addFilePreOrder( addFilePreOrderInput: AddFilePreOrderInput,user:User): Promise<Boolean> {
    
      try {
        const cacheKey = `file_pre_order_{id:${addFilePreOrderInput.pre_order_id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }
        const pattern = 'add_file_order'
       
        const payload = { addFilePreOrderInput,userId:user.id };
        const compressedPayload = this.compressionService.compressData(payload);
        
         this.rabbitAssetsService.send(pattern, { data: compressedPayload });
  

        return true
      } catch (error) {

        console.log('addFilePreOrder err',error)
        return false
        
      }   
    
      }


    
}
