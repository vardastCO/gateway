import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RabbitOrdersService } from 'src/rabbit-order.service';
import { User } from 'src/users/user/entities/user.entity';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { PreOrderDTO } from './dto/preOrderDTO';
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { RabbitAssetsService } from 'src/rabbit-asset.service';

@Injectable()
export class PreOrderService {
  constructor( 
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rabbitAssetsService: RabbitAssetsService, 
    private readonly rabbitOrdersService: RabbitOrdersService, 
    @InjectDataSource() private readonly dataSource: DataSource)
     { }

    async createPreOrder(createPreOrderInput : CreatePreOrderInput,user:User): Promise<PreOrderDTO> {
    
      try {
        const pattern = 'create_pre_order';
        const payload = { createPreOrderInput,userId:user.id };
        const compressedPayload = this.compressionService.compressData(payload);
        
        const result = await this.rabbitOrdersService.send(pattern, { data: compressedPayload });
  
        const response =  this.decompressionService.decompressData(result);

        return response
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
    private async getOrderData(id: number,isCacheEnabled:boolean) {
      const cacheKey = `pre_order_{id:${id}}`;
      if(isCacheEnabled){
        const cachedData = await this.cacheManager.get<string>(cacheKey);
    
        if (cachedData) {
          return  this.decompressionService.decompressData(cachedData);
        }
      
      }  
      const pattern = 'find_pre_order';
      const payload = { id};
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitOrdersService.send(pattern, { data: compressedPayload });
  
      const response =  this.decompressionService.decompressData(result);

      if(isCacheEnabled){
        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
      }
    
      return response;
    }
    private async getOrderLineData(id: number) {
      try {
        const cacheKey = `line_pre_order_{id:${id}}`;
        
        const cachedData = await this.cacheManager.get<string>(cacheKey);
    
        if (cachedData) {
          return  this.decompressionService.decompressData(cachedData);
        }
        const pattern = 'find_line_order';
        const payload = { id};
        const compressedPayload = this.compressionService.compressData(payload);
        
        const result = await this.rabbitOrdersService.send(pattern, { data: compressedPayload });
    
        const response =  this.decompressionService.decompressData(result);
        await this.cacheManager.set(cacheKey,result,CacheTTL.ONE_DAY);
      
        return response;
      }catch(e){

      }
      
    }
    private async getOrderFileData(id: number) {
      try {
        const cacheKey = `file_pre_order_{id:${id}}`;
        
        const cachedData = await this.cacheManager.get<string>(cacheKey);
    
        if (cachedData) {
          return  this.decompressionService.decompressData(cachedData);
        }
      
        const pattern = 'find_file_order';
        const payload = {id};
        const compressedPayload = this.compressionService.compressData(payload);
        
        const result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });
    
        const response =  this.decompressionService.decompressData(result);
        await this.cacheManager.set(cacheKey,result,CacheTTL.ONE_DAY);
      
        return response;
      }catch(e){

      }
      
    }
    async findPreOrderById(id : number,user:User): Promise<PreOrderDTO> {
    
      try {
        const promises = [
          this.getOrderData(id,true),
          this.getOrderLineData(id),
          this.getOrderFileData(id)
        ];

        const [orderData,OrderLine,OrderFile] = await Promise.all(promises);
        orderData.lines = OrderLine;
        orderData.files = OrderFile
    
        return orderData
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }
    
    async updatePreOrder(createPreOrderInput : CreatePreOrderInput,user:User): Promise<PreOrderDTO> {
    
      try {
        const pattern = 'create_pre_order';
        const payload = { createPreOrderInput,userId:user.id };
        const compressedPayload = this.compressionService.compressData(payload);
        
        const result = await this.rabbitOrdersService.send(pattern, { data: compressedPayload });
  
        const response =  this.decompressionService.decompressData(result);

        return response
      } catch (error) {

        console.log('create_pre_order err',error)
        
      }
    
    }


    
}
