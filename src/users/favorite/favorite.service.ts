// favorite.service.ts
import { Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { User } from "../user/entities/user.entity";
import { Favorite } from "./entities/favorite.entity";
import { EntityTypeEnum } from "./enums/entity-type.enum";
import { ProductDTO } from "src/product/product/dto/productDTO";
import { brandDto } from "src/product/brand/dto/brandDto";
import { RabbitMQService } from "src/rabbit-mq.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util copy";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { SellerDTO } from "src/seller/seller/dto/sellerDTO";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { Promote } from "./entities/promote.entity";
import { Address } from "../address/entities/address.entity";
import { PriceInfoDTO } from "src/seller/price/dto/price-info-input";
import { MessageEnum } from "src/product/product/enums/message.enum";
@Injectable()
export class FavoriteService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async findFavorites(
    type: EntityTypeEnum,
    user: User,
  ): Promise<ProductDTO[] | brandDto[] | SellerDTO[]> {
    const favorites: Favorite[] = await Favorite.findBy({
      entityType: type,
      userId: user.id,
    });
    const favoriteIds = favorites.map(favorite => favorite.entityId);
    
    switch (type) {
      case EntityTypeEnum.PRODUCT:
          return await this.findProductsByIds(favoriteIds);
      case EntityTypeEnum.CART:
          return await this.findProductsByIds(favoriteIds);
      case EntityTypeEnum.SELLER:
          return this.findSellersByIds(favoriteIds,false);
      case EntityTypeEnum.BRAND:
          return this.findBrandsByIds(favoriteIds);
      default:
          throw new Error('Invalid entity type');
  }
  }
  private async getSellerFile(sellerIds: number[]) {
    const cacheKey = `sellerFiles_{id:${sellerIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const payload = { sellerIds };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitAssetsService.send('getSellerFiles',  { data: compressedPayload });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);

    return response;
  }
  async promotedItems(
    type: EntityTypeEnum,
  ): Promise<ProductDTO[] | brandDto[] | SellerDTO[]> {
    const cacheKey = `promote_{type:${type}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      
      console.log('eeee',decompressedResultData)
      return decompressedResultData;
    }
    const promotes: Promote[] = await Promote.find({
      where: { entityType: type },
      take: 5,
    });

    const favoriteIds = promotes.map(favorite => favorite.entityId);
    let resultData 
    switch (type) {
      case EntityTypeEnum.PRODUCT:
        resultData = await this.findProductsByIds(favoriteIds);
        break;
      case EntityTypeEnum.SELLER:
        resultData = await this.findSellersByIds(favoriteIds ,true);
        break;
      case EntityTypeEnum.BRAND:
        resultData = await this.findBrandsByIds(favoriteIds);
        break;
      default:
          throw new Error('Invalid entity type');
    }
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(resultData), CacheTTL.THREE_DAYS);

    return resultData;
  
  }
  async  findProductsByIds(ids: number[]): Promise<ProductDTO[]> {
    const cacheKey = `findProductsByIds_{ids:${ids}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const pattern = 'find_products_by_ids';
    
    const payload = { ids };

    const compressedPayload = this.compressionService.compressData(payload);
    
    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result)
    
    const productParentIds = await this.extractProductParentIds(decompressedResultData);
    const promises = [
      this.sendImageMessage(ids),
      this.getParent(productParentIds),
      this.getNewPrices(ids,true),
    ];

    const [proudtcImage,parentData,newPrices] = await Promise.all(promises);

    const productsWithImageUrls = decompressedResultData.map((product: ProductDTO) => {
      const correspondingImageUrl = proudtcImage.find(asset => asset.productId === product.id) || null;
      const correspondingParent= parentData.find(parent => parent.id === product.parentId) || null;
      const correspondingAmount = newPrices.find(price => price.productId === product.id) || null;
      let price = []
      if(correspondingAmount){
        price.push(correspondingAmount)
      }
      if (correspondingImageUrl) {
        return {
            ...product,
            parent :correspondingParent,
            price : price,
            imageUrl: [correspondingImageUrl]
        };
      } else {
        return {
            ...product,
            parent :correspondingParent,
            price : price,
            imageUrl: [] 
        };
      }
    });

    await this.cacheManager.set(cacheKey,
      this.compressionService.compressData(productsWithImageUrls)
    ,CacheTTL.THREE_DAYS)
    ;

    return productsWithImageUrls;
   
  }
  private async getParent(productParentIds: number[]) {
    const cacheKey = `parent_{ids:${productParentIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const response = await this.rabbitMQService.send('getParentFromIds', { productParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return decompressedResultData;
  }
  async extractProductParentIds(result: any): Promise<number[]> {
    return result.map(item => item.parentId);
  }
  async  findBrandsByIds(ids: number[]): Promise<ProductDTO[]> {
    const cacheKey = `findBrandsByIds_{ids:${ids}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      console.log('decompressedResultData',decompressedResultData)
      return decompressedResultData;
    }
    const pattern = 'find_brands_by_ids';
    
    const payload = { ids };

    const promises = [
      this.sendBrandImageMessage(ids),
    ];
   
    const [branadImages] = await Promise.all(promises);

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result)
    const updatedResultData = await Promise.all(decompressedResultData.map(async (brand: brandDto, index: number) => {
      const correspondingImageUrl = branadImages.find(asset => asset.brandId === brand.id) || null;
 
      return {
          ...brand,
          files: [correspondingImageUrl],
      };
     }));

    await this.cacheManager.set(cacheKey,this.compressionService.compressData(updatedResultData),
    CacheTTL.ONE_MONTH);

    return updatedResultData;

   
  }
  async  findSellersByIds(ids: number[],brandshow): Promise<ProductDTO[]> {
    const cacheKey = `findSellersByIds_{ids:${ids}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const pattern = 'find_sellers_by_ids';
    
    const payload = { ids };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result)

    const sellerIds = await this.extractBrnadIds(decompressedResultData);
    const [addressData, sellerFile] = await Promise.all([
        this.getAdressInfo(sellerIds),
        this.getSellerFile(sellerIds)
    ])

    await Promise.all( decompressedResultData.map(async (seller: SellerDTO, index: number) => {
      const correspondingImageUrl = sellerFile.find(asset => asset.sellerId === seller.id) || [];
      const correspondingAddress = addressData.find(address => address.relatedId === seller.id) || null;
      seller.files = [correspondingImageUrl]
      if(correspondingAddress){
        seller.address = [correspondingAddress];
      }
      seller.brands = brandshow ? await this.getOfferBrand(seller.id) : []
      return seller
  
    }))


  
    await this.cacheManager.set(cacheKey,
      this.compressionService.compressData(decompressedResultData)
    ,CacheTTL.THREE_DAYS)
    ;

    return decompressedResultData;
   
  }

  private async getAdressInfo(sellerIds: number[]) : Promise<Address[]> {
    const promises = sellerIds.map(async (sellerId) => {
        const cacheKey = `address_{sellerId:${sellerId}}`;

        const cachedData = await this.cacheManager.get<string>(cacheKey);

        if (cachedData) {
            const decompressedData: Address[] = this.decompressionService.decompressData(cachedData);
            return decompressedData;
        }

        const res = await Address.find({
            where: {
                relatedId: sellerId
            },
            relations:['city']
        });
        const jsonString = JSON.stringify(res).replace(/__city__/g, 'city');

        const modifiedDataWithOutText = JSON.parse(jsonString);

        const result = this.compressionService.compressData(modifiedDataWithOutText);

        await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_DAY);

        const decompressedResult = this.decompressionService.decompressData(result);
        return decompressedResult;
    });
    const addresses = await Promise.all(promises);

    return addresses.flat();

}
  async getOfferBrand(sellerId:number) : Promise<brandDto[]>{
    const cacheKey = `getOfferBrand_{sellerId:${sellerId}}`;
        
    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {
      return this.decompressionService.decompressData(cachedData);
    }
    const payload = {sellerId};
  
    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('filter_brand_by_seller', { data: compressedPayload  });
    const decompressedResultData = this.decompressionService.decompressData(result)
    const brandIds = await this.extractBrnadIds(decompressedResultData);
    const promises = [
      this.sendBrandImageMessage(brandIds),
    ];

    const [branadImages] = await Promise.all(promises);
    console.log('gggggg',branadImages)
    const updatedResultData = await Promise.all(decompressedResultData.map(async (brand: brandDto, index: number) => {
      const correspondingImageUrl = branadImages.find(asset => asset.brandId === brand.id) || [];
      console.log('gggggg',correspondingImageUrl)
      return {
          ...brand,
          files: [correspondingImageUrl],
      };
     }));
  
          await this.cacheManager.set(cacheKey,this.compressionService.compressData(updatedResultData),
    CacheTTL.ONE_MONTH);

    return updatedResultData;
  }
  private async sendBrandImageMessage(brandIds: number[]) {
    const cacheKey = `brandFiles_{id:${brandIds}}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const payload = { brandIds };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitAssetsService.send('getBrandFiles',  { data: compressedPayload });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);

    return response;
  }
  async extractBrnadIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }
  private async sendImageMessage(productIds: number[]) {
    const cacheKey = `productImage_{ids:${productIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const response = await this.rabbitAssetsService.send('getImageProduct', { productIds });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return response;
  }

// // Function to find sellers by IDs
// async  findSellersByIds(favoriteIds: number[]): Promise<SellerDTO[]> {
//     return SellerDTO.findBy({
//         id: In(favoriteIds),
//     });
// }

// // Function to find brands by IDs
// async  findBrandsByIds(favoriteIds: number[]): Promise<BrandDTO[]> {
//     return BrandDTO.findBy({
//         id: In(favoriteIds),
//     });
// }
  async isFavorite(
    userId: number,
    entityId: number,
    entityType: EntityTypeEnum,
  ): Promise<boolean> {
    const count = await Favorite.count({
      where: { userId, entityId, entityType },
    });

    return count > 0;
  }
  async updatePromote(
    entityId: number,
    entityType: EntityTypeEnum, 
  ) {
    try {
      const cacheKey = `promote_{type:${entityType}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      const userFavorite = Promote.create();
      userFavorite.entityType = entityType;

      userFavorite.entityId = entityId;

      await userFavorite.save();
      return true;
    } catch (error) {
      console.error("Error adding promote item:", error);

    }
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
  async removePromote(
    entityId: number,
    entityType: EntityTypeEnum, 
  ) {
    try {
      const cacheKey = `promote_{type:${entityType}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      const result: Promote = await Promote.findOneBy({
        entityType: entityType,
        entityId: entityId,
      });
      if(result){
        await result.remove()
      }
      return true;
    } catch (error) {
      console.error("Error adding promote item:", error);
    }
  }
  async updateFavorite(
    userData: User,
    entityId: number,
    entityType: EntityTypeEnum, 
  ) {
    try {
    
      const existFavorite = await Favorite.findOneBy({
        entityType,
        userId:userData.id,
        entityId,
      });
      if (existFavorite) {
        await existFavorite.remove(); 
        return false;
      }

      const userFavorite = Favorite.create();
      userFavorite.entityType = entityType;

      userFavorite.user = Promise.resolve({ id: userData.id } as User);
      userFavorite.entityId = entityId;

      await userFavorite.save();
      return true;
    } catch (error) {
      console.error("Error adding favorite item:", error);

    }
  }
}
