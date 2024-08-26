import { ClientProxy } from '@nestjs/microservices';
import { ProductDTO } from './dto/productDTO';
import { PaginationProductResponse } from './dto/pagination-product.response';
import { IndexProductInput } from './dto/index-product.input';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { AttributeValueDto } from '../attribute/dto/attributeValueDto';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { OptionDTO } from '../option/dto/optionDTO';
import { CreateProductInput } from './dto/create-product.input';
import { User } from 'src/users/user/entities/user.entity';
import { RabbitLogsService } from 'src/rabbit-log.service';
import { UpdateProductInput } from './dto/update-product.input';
import { PriceInfoDTO } from 'src/seller/price/dto/price-info-input';
import { IsCacheEnabled } from 'src/base/cache.decorator';
import { MessageEnum } from './enums/message.enum';
import { AuthorizationService } from 'src/users/authorization/authorization.service';

@Injectable()
export class ProductService {
  private productService: ClientProxy;

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService,
    private authorizationService: AuthorizationService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly rabbitLogsService: RabbitLogsService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async AddView(id:number,type:string){
    try {
      const payload = { id ,type };
      const compressedPayload = this.compressionService.compressData(payload);
        
      this.rabbitLogsService.send('add_view', { data: compressedPayload });
    } catch(e){
      console.log('err add view',e)
    }
  }
  async pagination(indexProductInput: IndexProductInput,user:User): Promise<PaginationProductResponse> {
    indexProductInput.boot();
    let admin = false
    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      admin = true
    }
    const cacheKey = `produtcs_${JSON.stringify(indexProductInput)}`;
    if(admin){
      
  
      const cachedData = await this.cacheManager.get<string>(cacheKey);
    
      if (cachedData) {
        const decompressedData : PaginationProductResponse = 
        this.decompressionService.decompressData(cachedData);
   
        return decompressedData;
  
      }
    }


    const pattern = 'pagination_product';
    
    const payload = { indexProductInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result);

    const productIds = await this.extractProductIds(decompressedResultData[0]);
    const productParentIds = await this.extractProductParentIds(decompressedResultData[0]);

    const promises = [
      this.sendImageMessage(productIds,true),
      this.getNewPrices(productIds,true),
      this.getOptions(productParentIds,true),
      this.getVarient(productParentIds,true),
      indexProductInput.moreDetail ? this.getLowestPrices(productIds) : Promise.resolve([]),
      indexProductInput.moreDetail ? this.getHighestPrices(productIds) : Promise.resolve([]),
      this.getParent(productParentIds,true) 
    ];

    const [productImages, newPrices,optionsData,varientData, lowestPrices,highestPrice,parentdata] = await Promise.all(promises);
    
    const products = decompressedResultData[0].map((product: ProductDTO, index: number) => {
      const correspondingImageUrl = productImages.find(asset => asset.productId === product.id) || null;
      const correspondingAmount = newPrices.find(price => price.productId === product.id) || null;
      const corresparentData = parentdata.find(parent => parent.id === product.parentId) || null;
      const correspondingLowestAmount = lowestPrices.find(price => price.productId === product.id) || null;
      const correspondingHighesttAmount = highestPrice.find(price => price.productId === product.id) || null;
    
      let options: OptionDTO[] = [];

      if (optionsData) {
        // Group options by their attribute name and parent product id
        const groupedOptions = optionsData.reduce((acc, option) => {
          const key = `${option.attribute_name}:${option.parentProductId}`;
          const existingOption = acc[key];
          if (existingOption) {
            existingOption.variantValues.push({
              productId: option.product_id,
              value: option.varient_value
            });
          } else {
            acc[key] = {
              id: option.option_id,
              attribute: option.attribute_name,
              variantValues: [{
                productId: option.product_id,
                value: option.varient_value
              }]
            };
          }
          return acc;
        }, {});
      
        options = Object.values(groupedOptions).map(option => new OptionDTO(option));
      }
      let price = []
      if(correspondingHighesttAmount){
        price.push(correspondingHighesttAmount)
      }
      if(correspondingLowestAmount){
        price.push(correspondingLowestAmount)
      }
      if(correspondingAmount){
        price.push(correspondingAmount)
      }
      return {
        ...product,
        imageUrl: correspondingImageUrl ? [correspondingImageUrl] : [],
        price: price,
        parent : corresparentData,
        options: options,
        varient: varientData,
      };
      
    });
    
    const decompressedResult: PaginationProductResponse =
        PaginationProductResponse.make(indexProductInput, decompressedResultData[1], products);
    
    if(admin){
      await this.cacheManager.set(cacheKey, this.compressionService.compressData(decompressedResult),CacheTTL.THREE_DAYS);
    }
    
    return decompressedResult;
    
  }
  async update(
    id: number,
    updateProductInput: UpdateProductInput,
  ): Promise<ProductDTO> {
    const cacheKey = `product_{id:${id}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const payload = { updateProductInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('update_product', { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);
    return decompressedResultData;
  }
  async extractProductIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }
  async extractProductParentIds(result: any): Promise<number[]> {
    return result.map(item => item.parentId);
  }

  private async sendImageMessage(productIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `productImage_{ids:${productIds}}`;
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        return cachedData;
      }
    
    }  

    const response = await this.rabbitAssetsService.send('getImageProduct', { productIds });
    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    }
  
    return response;
  }
  private async getNewPrices(productIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `newst_price_{ids:${productIds}}`;
    if(isCacheEnabled){
    
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        
        return decompressedResultData;
      }
    }
      
   
    const response = await this.rabbitSellersService.send('getNewPriceFromIds', { productIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
    
      if (price.amountwithdiscount) {
          return {
              productId:price.productId,
              type: 'NEWEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              productId:price.productId,
              type: 'NEWEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
  if(isCacheEnabled){
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
  
  }

    return formattedPrices;
  }




  private async getOptions(productParentIds: number[],isCacheEnabled) {
    const cacheKey = `options_{ids:${productParentIds}}`;
    
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    
    }

    const response = await this.rabbitMQService.send('getOptionsFromIds', { productParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)


    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
    }
 
    return decompressedResultData;
  }

  private async getVarient(productParentIds: number[],isCacheEnabled:boolean)  {
    const cacheKey = `varient_{ids:${productParentIds}}`;
    if(isCacheEnabled){
    
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    }
      
   
    const response = await this.rabbitMQService.send('getVarientFromIds', { productParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)
   if(isCacheEnabled){
    await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
   }
    
    return decompressedResultData;
  }

  private async getParent(productParentIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `parent_{ids:${productParentIds}}`;
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    
    }
   
    const response = await this.rabbitMQService.send('getParentFromIds', { productParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
    }
    return decompressedResultData;
  }

  private async getLowestPrices(productIds: number[]) {
    const cacheKey = `lowest_price_{ids:${productIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const response = await this.rabbitSellersService.send('getLowestPricesFromIds', { productIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
      if (price.amountwithdiscount) {
          return {
              productId:price.productId,
              type: 'LOWEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              productId:price.productId,
              type: 'LOWEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
  }

  private async getHighestPrices(productIds: number[]) {
    const cacheKey = `highest_price_{ids:${productIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const response = await this.rabbitSellersService.send('getHighestPricesFromIds', { productIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
      if (price.amountwithdiscount) {
          return {
            productId:price.productId,
              type: 'HIGHEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              productId:price.productId,
              type: 'HIGHEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
  }

  async findOne(id: number, isCacheEnabled:boolean): Promise<ProductDTO>{
      try {
          this.AddView(id,'PRODUCT')
          const cacheKey = `product_{id:${id}}`;
  
          if (isCacheEnabled) {
            const cachedData = await this.cacheManager.get<string>(cacheKey);
            if (cachedData) {
                const decompressedData: ProductDTO = this.decompressionService.decompressData(cachedData);
                return decompressedData;
  
            }
            
          }

          const pattern = 'find_one_product';
          const attributesPattern = 'find_one_product_attribute';
          const payload = { id };
          const compressedPayload = this.compressionService.compressData(payload);
          
          const [result, attributesResult,imageResult,newPrices] = await Promise.all([
              this.rabbitMQService.send(pattern, { data: compressedPayload }),
              this.rabbitMQService.send(attributesPattern, { data: compressedPayload }),
              this.rabbitAssetsService.send('getImageProduct', { productIds:[id] }),
              this.getNewPrices([id],true),
          ]);
          
          // Decompress data
          const decompressedResult = this.decompressionService.decompressData(result);
          const decompressedAttributesResult = this.decompressionService.decompressData(attributesResult);
          const attributes: AttributeValueDto[] = await this.mapProductAttributes(decompressedAttributesResult);

          let options = [];

          const [optionsData, varient,parent] = await Promise.all([
            this.getOptions([decompressedResult.parentId],true),
            this.getVarient([decompressedResult.parentId],true),
            this.getParent([decompressedResult.parentId],true),
        ]);

          if (optionsData) {
            options = Object.values(optionsData.reduce((acc, option) => {
              if (option.parentProductId === decompressedResult.parentId) {
                const key = `${option.attribute_name}:${option.parentProductId}`;
                const existingOption = acc[key];
                if (existingOption) {
                  existingOption.variantValues.push({
                    productId: option.product_id,
                    value: option.varient_value
                  });
                } else {
                  acc[key] = {
                    id: option.option_id,
                    attribute: option.attribute_name,
                    variantValues: [{
                      productId: option.product_id,
                      value: option.varient_value
                    }]
                  };
                }
              }
              return acc;
            }, {}));
          }
          for (const varientItem of varient) {
            const varientOptions = optionsData.filter(option => option.product_id === varientItem.id);
            const varientOptionsMapped = varientOptions.map(option => ({
              id: option.option_id,
              attribute: option.attribute_name,
              variantValues: [{
                productId: varientItem.id,
                value: option.varient_value,
              }],
            }));
            varientItem.options = varientOptionsMapped;
          }
          const correspondingAmount = newPrices.find(price => price.productId === id) || null;
          const productDto: ProductDTO = {
              id: decompressedResult.id,
              offers_count:decompressedResult.offers_count,
              name: decompressedResult.name,
              description: decompressedResult.description,
              sku: decompressedResult.sku,
              // price: {
              //   values : null
              //   type : 'NEWEST'
              //   // lowest_price: null,
              //   // highest_price: null,
              //   // newest_price: correspondingAmount
              // },
              price:[],
              options: options,
              parentId:decompressedResult.parentId,
              varient: varient,
              rating:decompressedResult.rating,
              imageUrl : imageResult,
              parent: parent[0], 
              status: decompressedResult.status,
              attributes: attributes
          };
          if (isCacheEnabled){
            await this.cacheManager.set(cacheKey,this.compressionService.compressData (productDto), CacheTTL.THREE_DAYS);
          
          }
        
          return productDto;
      } catch (error) {
          // Handle errors
          throw new Error(`Error in findOne: ${error}`);
      }

  }

  async mapProductAttributes(data: any[]): Promise<AttributeValueDto[]> {
    return data.map(item => {
      return new AttributeValueDto(item.id,item.attribute.name, item.value.value);
    });
  }

  async similarproduct(id: number): Promise<ProductDTO[]> {
    const cacheKey = `similar_product_{id:${id}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : ProductDTO[] = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;
    }
    const pattern = 'similar_product' ;
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);
    const productIds = await this.extractProductIds(decompressedResultData);

    const promises = [
      this.sendImageMessage(productIds,true),
      this.getNewPrices(productIds,true),
    ];

    const [productImages, newPrices] = await Promise.all(promises);
    
    const products = decompressedResultData.map((product: ProductDTO, index: number) => {

      const correspondingImageUrl = productImages.find(asset => asset.productId === product.id) || null;
      const correspondingAmount = newPrices.find(price => price.productId === product.id) || null;
  
    
      let price = []
      if(correspondingAmount){
        price.push(correspondingAmount)
      }
      return {
        ...product,
        imageUrl: correspondingImageUrl ? [correspondingImageUrl] : [],
        price: price
      };
    });

    await this.cacheManager.set(cacheKey, this.compressionService.compressData(products),
    CacheTTL.ONE_WEEK);

    return products;

  }
  async remove(id: number): Promise<boolean>{
    const cacheKey = `product_{id:${id}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const pattern = 'remove_product' ;
    const payload = { id };
    const compressedPayload = this.compressionService.compressData(payload);

    let result = this.rabbitMQService.send(pattern, { data: compressedPayload });

    return true;
  }

  async createVarientFromExistProduct(
    orginal_produtc_id: number,
    similar_produtc_id:number,
    attribuite_id : number,
    similar_value_id : number,
    orginal_value_id : number
  
  ): Promise<ProductDTO>{
    try{
      const payload = { 
        orginal_produtc_id,
        similar_produtc_id,
        attribuite_id,
        similar_value_id,
        orginal_value_id 
      };

      const compressedPayload = this.compressionService.compressData(payload);

       const pattern = 'create_varient_exist_product' ;
       let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
       const decompressedResultData = this.decompressionService.decompressData(result);


      const promises = [
        this.createOtions(attribuite_id,orginal_value_id,orginal_produtc_id,decompressedResultData.parentId),
        this.createOtions(attribuite_id,similar_value_id,similar_produtc_id,decompressedResultData.parentId),
      ];
  
      const [res1,res2] = await Promise.all(promises);
      console.log(res1,res2)
      return decompressedResultData

    }catch(e){
      console.log('err in createVarientFromExistProduct ',e)
    }
    
  }
  async createOtions(att_id : number,value_id: number,product_id : number,parent_id:number): Promise<boolean> {

    try {
      const createOptionDto =  {
       'attribuiteId': att_id, 
       'valueIds': [value_id], 
       'productId': product_id,
       'parentProductId' : parent_id
      }
      const pattern = 'create_option_manual';
      const payload = { createOptionDto };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
      return result ;
    } catch (error) {
      console.log('e create_option_manual ',error)
       return false
    }

  }
  async create(createProductInput: CreateProductInput,user:User): Promise<ProductDTO> {
    try{
      const pattern = { cmd: 'create_product' };
      const payload = { createProductInput };
      let result = await this.productService.send(pattern, payload).toPromise();
  
      const decompressedResult = this.decompressionService.decompressData(result);
  
      return decompressedResult;
    }catch(e){
     console.log('err createProductInput ',e)
    }
    
  }
}
