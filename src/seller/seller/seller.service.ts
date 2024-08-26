import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { BecomeASellerInput } from './dto/become-a-seller.input';
import { User } from 'src/users/user/entities/user.entity';
import { SellerDTO } from './dto/sellerDTO';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { Role } from 'src/users/authorization/role/entities/role.entity';
import { SellerStats } from './dto/profile-seller.response';
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { CreateOfferInput } from './dto/create-offer.input';
import { OfferDTO } from './dto/offerDTO';
import { SellerRepresentativeDTO } from './dto/SellerRepresentativeDTO';
import { IndexSellerInput } from './dto/index-seller.input';
import { PaginationSellerResponse } from './dto/pagination-seller.response';
import { IndexMyofferInput } from './dto/index-my-offer.input';
import { PaginationMyOfferResponse } from './dto/pagination-my-offer.response';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { ProductDTO } from 'src/product/product/dto/productDTO';
import { UpdateSellerInput } from './dto/update-seller.input';
import { CreateProductTemporaryInput } from './dto/create-product-temporary.input';
import { ProductTemporaryDTO } from './dto/Product-temporary-DTO';
import { Address } from 'src/users/address/entities/address.entity';
import { ContryTypes } from 'src/users/auth/enums/country-types.enum';
import { AddressRelatedTypes } from 'src/users/address/enums/address-related-types.enum';
import { ProvinceTypes } from 'src/users/auth/enums/province-types.enum';
import { IndexTempInput } from './dto/index-temp.input';
import { PaginationTempResponse } from './dto/pagination-temp.response';
import { ContactInfo } from 'src/users/contact-info/entities/contact-info.entity';
import { CreateSellerFileInput } from './dto/create-seller-file.input';
import { FileSellerDTO } from 'src/asset/dto/fileSellerDTO';
import { brandDto } from 'src/product/brand/dto/brandDto';
import { IndexPublicofferInput } from './dto/index-public-offer.input';
import { DiscountDTO } from '../price/dto/DiscountDTO';
import { PriceDTO } from '../price/dto/PriceDTO';
import { PriceInfoDTO } from '../price/dto/price-info-input';
import { CreateProductTemporaryAttribuiteInput } from './dto/create-product-temporary-attribuite.input';
import { CreateProductTemporaryfileInput } from './dto/create-product-temporary-file.input';
import { MessageEnum } from 'src/product/product/enums/message.enum';
import { RabbitLogsService } from 'src/rabbit-log.service';
@Injectable()
export class SellerService {
  

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService, 
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitLogsService: RabbitLogsService, 
    private readonly rabbitAssetsService: RabbitAssetsService,  
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async becomeASeller(
    becomeASellerInput: BecomeASellerInput,
    user: User,
  ): Promise<SellerDTO> {

    try {
      const pattern = 'create_seller';
    
      const payload = { becomeASellerInput, userId:user.id };

      const compressedPayload = this.compressionService.compressData(payload);

      let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
      
      const repUserRoles = await user.roles;
      repUserRoles.push(await Role.findOneBy({ name: "seller" }));
      user.roles = Promise.resolve(repUserRoles);
      await user.save();

      if(becomeASellerInput.address){
        const address = new Address()
        address.cityId = becomeASellerInput.cityId
        address.countryId = ContryTypes.IRAN
        address.provinceId = ProvinceTypes.TEHRAN
        address.address = becomeASellerInput.address
        address.relatedType = AddressRelatedTypes.SELLER
        address.relatedId = result.id
        address.title = "آدرس"
        address.latitude = becomeASellerInput.latitude ?? null
        address.longitude = becomeASellerInput.longitude ?? null

        await address.save()
      }

      this.rabbitSellersService.send('upload_logo_seller', { data: compressedPayload, seller:result  });

      return result;
    }catch(e){
      console.log('ee',e)
      throw new Error('seller with the same name already exists');
      
    }
  }

  async tempProduct(
    indexTempInput:IndexTempInput
  ): Promise<PaginationTempResponse> {

    try {
      indexTempInput.boot()
      const pattern = 'pagination_temp_product';
  

      const compressedPayload = this.compressionService.compressData(indexTempInput);

      let result = await this.rabbitMQService.send(pattern, { data: compressedPayload  });
      
      const decompressResult = this.decompressionService.decompressData(result)
      const res: PaginationTempResponse =
      PaginationTempResponse.make(indexTempInput, decompressResult[1], decompressResult[0]);
 
      return res;
    }catch(e){
      console.log('ee',e)
      throw new Error('seller with the same name already exists');
      
    }

  }

  async update(
    updateSellerInput: UpdateSellerInput,
    user: User,
  ): Promise<SellerDTO> {
    try {
    
      const sellerId = updateSellerInput.id ?? (await this.findSeller(user.id)).sellerId

      const pattern = 'update_seller';
      
      const payload = { updateSellerInput, userId:user.id,sellerId };

      const compressedPayload = this.compressionService.compressData(payload);

      let seller = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
      const result = this.decompressionService.decompressData(seller)
      // if (updateSellerInput.logo_file_id) {
      //   const becomeASellerInput = {logo_fileId :updateSellerInput.logo_file_id}
      //   const payload = { becomeASellerInput, userId:user.id,sellerId };
      //   const compressedPayload_file = this.compressionService.compressData(payload);
      //   this.rabbitSellersService.send('upload_logo_seller', { data: compressedPayload_file, seller:result  });
      // }
      
      if (result){
        return result
      }
    } catch(e) {
      console.log('update seller api err',e)
      throw new Error(`duplicate offer seller ${e}`);
    }
  
  }
  private async getContactInfo(sellerId: number) : Promise<ContactInfo[]> {
    const cacheKey = `contact_{sellerId:${sellerId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);


    if (cachedData) {
          const decompressedData : ContactInfo[] = 
          this.decompressionService.decompressData(cachedData);
          
          return decompressedData;
    
    }

    const res = await ContactInfo.find({
      where : {
        relatedId : sellerId
      }
    })
    const result = this.compressionService.compressData(res)

    await this.cacheManager.set(cacheKey,result,CacheTTL.ONE_MONTH);

    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;
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
  async findOneData(id: number): Promise<SellerDTO> {
    try {
      const cacheKey = `selelrData_{sellerId:${id}}`;
  
      const cachedData = await this.cacheManager.get<string>(cacheKey);
    
      if (cachedData) {
        
        return this.decompressionService.decompressData(cachedData);
      }

      const pattern = 'find_one_seller';
      
      const payload = { id };

      const compressedPayload = this.compressionService.compressData(payload);

      let temp = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
      const result = this.decompressionService.decompressData(temp)
      if (result){
        await this.cacheManager.set(cacheKey, temp,CacheTTL.ONE_DAY);
        return result
      }

    } catch (e) {
      throw e
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
  private async getPriceData(id: number) {

    const cacheKey = `price_{id:${id}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return this.decompressionService.decompressData(cachedData);
    }
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitSellersService.send('getPriceData',  { data: compressedPayload });

    const result = this.decompressionService.decompressData(response)

    const mappedResult = result.map(item => {

      const priceDTO = new PriceDTO({
        amount: item.amount,
        createdAt : item.createdAt,
      });
      if(item.calculated_price){
        const discount = new DiscountDTO({
          value: item.value ?? '0',
          orginal_price: item.orginal_price ?? '0',
          type: 'PERCENTAGE',
          calculated_price: item.calculated_price ?? '0'
        })
      priceDTO.discount = discount
      }

      const priceInfoDTO = new PriceInfoDTO();
      priceInfoDTO.value = priceDTO;
    
      priceInfoDTO.type = 'LATEST';
      return priceInfoDTO;
    });
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(mappedResult)
    ,CacheTTL.ONE_DAY);
    return mappedResult;
  }
  async AddView(id:number,type:string){
    try {
      const payload = { id ,type };
      const compressedPayload = this.compressionService.compressData(payload);
        
      this.rabbitLogsService.send('add_view', { data: compressedPayload });
    } catch(e){
      console.log('err add view',e)
    }
  }
  async findOne(id: number): Promise<SellerDTO> {
    try {
      this.AddView(id,'SELLER')
      const promises = [
        this.getContactInfo(id),
        this.getAdressInfo([id]),
        this.findOneData(id),
        this.getSellerFile([id])
        ];
  
      const [contactdata,addressData,sellerData,sellerFile] = await Promise.all(promises);

      const typedSellerData = sellerData as SellerDTO;
      const typedSellerFile = sellerFile as FileSellerDTO[];
      const typedContactData = contactdata as ContactInfo[];
      const typedAddressData = addressData as Address[];
      
      typedSellerData.contact = typedContactData;
      typedSellerData.address = typedAddressData;
      typedSellerData.files   = typedSellerFile;
      return typedSellerData;


    } catch (e) {
      throw e
    }
   
  }

  async findOneTemp(id: number): Promise<ProductTemporaryDTO> {
    try {
      const cacheKey = `temp_{${JSON.stringify(id)}}`;
  
      const cachedData = await this.cacheManager.get<string>(cacheKey);
    
      if (cachedData) {
        
        return this.decompressionService.decompressData(cachedData);
      }

  
      const promises = [
        // this.sendTempAttribuiteMessage(id),
        this.sendTempMessage(id),
        // this.sendTempImageMessage(id),
      ];
  
      const [tempInfo] = await Promise.all(promises);

        
      return tempInfo
      

    } catch (e) {
      throw e
    }
   
  }
  async removeTemp(id: number): Promise<boolean> {
    try {

      const pattern = 'remove_temp';
      
      const payload = { id };

      const compressedPayload = this.compressionService.compressData(payload);

       this.rabbitMQService.send(pattern, { data: compressedPayload  });

  
      return true
    

    } catch (e) {
      return false
    }
   
  }
  private async sendTempImageMessage(productId: number) {
    const cacheKey = `tempImage_{ids:${productId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const response = await this.rabbitAssetsService.send('getImageTemp', { productId });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return response;
  }
  private async sendTempMessage(id: number) {
    const cacheKey = `temp_info_{id:${id}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return this.decompressionService.decompressData(cachedData);
    }
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitMQService.send('find_one_temp', { data:compressedPayload});
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    const result = this.decompressionService.decompressData(response)
   
    return result;
  }
  private async sendTempAttribuiteMessage(productId: number) {
    const cacheKey = `temp_attribuite_{ids:${productId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const response = await this.rabbitMQService.send('getImageTemp', { productId });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return response;
  }
  async addTemporaryProduct(
    createProductTemporaryInput: CreateProductTemporaryInput,
    user:User
  ): Promise<ProductTemporaryDTO> {
    try {
    
      const sellerId = (await this.findSeller(user.id)).sellerId

      const pattern = 'add_temporary_product';
      
      const payload = { createProductTemporaryInput, userId:user.id,sellerId };

      const compressedPayload = this.compressionService.compressData(payload);

      let temp = await this.rabbitMQService.send(pattern, { data: compressedPayload  });
      const result = this.decompressionService.decompressData(temp)

      if (result){
        return result
      }
    } catch(e) {
      console.log('add_temporary_product',e)
      throw new Error(`add_temporary_product ${e}`);
    }
  
  }
  async addTemporaryAtribuiteProduct(
    createProductTemporaryAttribuiteInput: CreateProductTemporaryAttribuiteInput,
    user:User
  ): Promise<boolean> {
    try {
    
      // const sellerId = (await this.findSeller(user.id)).sellerId

      const pattern = 'add_temporary_product_attribuite';
      
      const payload = { createProductTemporaryAttribuiteInput };

      const compressedPayload = this.compressionService.compressData(payload);

      this.rabbitMQService.send(pattern, { data: compressedPayload  });

      return true
    } catch(e) {
      return false
    }
  
  }
  async addTemporaryFileProduct(
    createProductTemporaryfileInput: CreateProductTemporaryfileInput,
    user:User
  ): Promise<boolean> {
    try {
    
      // const sellerId = (await this.findSeller(user.id)).sellerId

      const pattern = 'add_temporary_product_file';
      
      const payload = { createProductTemporaryfileInput };

      const compressedPayload = this.compressionService.compressData(payload);

      this.rabbitMQService.send(pattern, { data: compressedPayload  });


      return true
    } catch(e) {
      return false
    }
  
  }
  async create(createOfferInput: CreateOfferInput, user: User): Promise<OfferDTO> {
    try {
    
        const sellerId = (await this.findSeller(user.id)).sellerId

        const pattern = 'create_offer';
        
        const payload = { createOfferInput, userId:user.id,sellerId };

        const compressedPayload = this.compressionService.compressData(payload);

        let offer = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
        const result = this.decompressionService.decompressData(offer)
        if (result){
          return result
        }
    } catch(e) {

      throw new Error('duplicate offer seller ');
    }
  }
  async remove_offer(user: User, offerId: number): Promise<boolean> {
    try {
      const sellerId = (await this.findSeller(user.id)).sellerId

      const pattern = 'remove_offer';
        
      const payload = { offerId, userId:user.id,sellerId };

      const compressedPayload = this.compressionService.compressData(payload);

      let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });

      if (result){
        
        return result
      }

    } catch (e) {
      console.log('remove_offer',e)
      return false
    }
  }
  async my_offer(indexMyofferInput: IndexMyofferInput, user: User): Promise<PaginationMyOfferResponse> {
    try {
       indexMyofferInput.boot()
        const sellerId = (await this.findSeller(user.id)).sellerId

        const pattern = 'my_offer';
        
        const payload = { indexMyofferInput, userId:user.id,sellerId };

        const compressedPayload = this.compressionService.compressData(payload);

        let offer = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
        const result = this.decompressionService.decompressData(offer)

        if (result[1] > 0){
          const productIds = await this.extractProductIds(result[0]);
          const promises = [
            this.sendImageMessage(productIds),
            this.getproductData(productIds),
            this.getHighestPrices(productIds),
            this.getLowestPrices(productIds),

          ];
          const [productImages,productsData,highestPrice,lowestPrices] = await Promise.all(promises);
          let decompressedResultData = this.decompressionService.decompressData(productsData)
          const productParentIds = await this.extractProductParentIds(decompressedResultData);
 
          const [parentData] = await Promise.all([
            this.getParent(productParentIds),
          ]);

          const products = decompressedResultData.map((product: ProductDTO, index: number) => {
            const correspondingImageUrl = productImages.find(asset => asset.productId === product.id) || null;
   
            const correspondingParent = parentData.find(parent => parent.id === product.parentId) || null;

            let options = [];
           
            return {
              ...product,
              imageUrl: [correspondingImageUrl],
              options: options,
              parent: correspondingParent,
              varient:null,
            };
          });

          const offers = result[0].map((offer: OfferDTO, index: number) => {
            const correspondingOffer = products.find(product => product.id === offer.productId) || null;
            
            const highest = highestPrice.find(price => price.productId === correspondingOffer.id) || null;
            const lowest = lowestPrices.find(price => price.productId === correspondingOffer.id) || null;
            let price = []
            if(highest){
              price.push(highest)
            }
            if(lowest){
              price.push(lowest)
            }
            return {
              ... offer,
              product :correspondingOffer,
              price : price
            }
          })

          const decompressedResult: PaginationMyOfferResponse =
          PaginationMyOfferResponse.make(indexMyofferInput, result[1], offers);

          return decompressedResult
        }
        return PaginationMyOfferResponse.make(indexMyofferInput, 0, []);

    } catch(e) {

      console.log('my_offer gateway service',e)

      throw new Error('cant find offer seller ');
    }
  }
  async extractProductParentIds(result: any): Promise<number[]> {
    return result.map(item => item.parentId);
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
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
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
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
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

      
      await this.cacheManager.set(cacheKey,this.compressionService.compressData(result),CacheTTL.ONE_DAY);
      return result
    }catch(e){
      throw new Error(`Error in find_seller : ${e.message}`);
    }
  }
  async productOffers(indexPublicofferInput: IndexPublicofferInput): Promise<PaginationMyOfferResponse> {
    try {
       indexPublicofferInput.boot()
        const promises = [
          this.getOffers('getOffers',indexPublicofferInput),
        ]

        const [offersData] = await Promise.all(promises);
        const mappedOffersData = await Promise.all(offersData[0].map(async (offer) => {
          const typedSellerData = offer.seller as SellerDTO;
          const contactData = await this.getContactInfo(typedSellerData.id);
          const addressData = await this.getAdressInfo([typedSellerData.id]);
          const files = await this.getSellerFile([typedSellerData.id])
          const PriceData = await this.getPriceData(offer.last_price_id) 
          const price = await PriceData.length > 0 ? PriceData : null
          typedSellerData.contact = contactData;
          typedSellerData.address = addressData;
          typedSellerData.files = files;
          offer.price = price;
          return offer;
      }));
      const decompressedResult: PaginationMyOfferResponse =
      PaginationMyOfferResponse.make(indexPublicofferInput, offersData[1], mappedOffersData);
      return decompressedResult;

    } catch (e) {
        console.log('Error productOffers:', e);
    }
  }

  async myProfileSeller(userId: number): Promise<SellerStats> {
    try {

        const sellerId = (await this.findSeller(userId)).sellerId
        const promises = [
          this.sendMessage('my_short_data_seller_products',sellerId),
          this.sendMessage('my_short_data_seller_categories',sellerId),
          this.sendMessage('my_short_data_seller_views',sellerId),
          this.sendMessage('my_short_data_seller_brands',sellerId)
        ]

        const [productsCount, categoriesCount,viewsCount, brandsCount] = await Promise.all(promises);
        const sellerStatsResponse: SellerStats = {
          brandsCount,
          categoriesCount,
          productsCount,
          viewsCount
        };
    
        return sellerStatsResponse
    } catch (e) {
        console.log('Error:', e);
    }
  }


  async  getOffers(pattern, indexPublicofferInput) {
    const cacheKey = `offers_product_{productId:${indexPublicofferInput.productId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
  
      return this.decompressionService.decompressData(cachedData);

    }
    const payload = {indexPublicofferInput};
    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });

    await this.cacheManager.set(cacheKey, result,CacheTTL.THREE_DAYS);
    return  this.decompressionService.decompressData(result) 
  }

  async  sendMessage(pattern, sellerId) {
    const compressedPayload = this.compressionService.compressData(sellerId);
    const cacheKey = `sellers_{pattern:${pattern},sellerId:${sellerId}}`;
      
    const cachedData = await this.cacheManager.get<number>(cacheKey);
  
    if (cachedData) {
  
      return cachedData;

    }
   
    const result = await this.rabbitSellersService.send(pattern, { data: compressedPayload });
    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    
    return  result 
  }

  async paginate(
    user: User,
    indexSellerInput?: IndexSellerInput,
  ): Promise<PaginationSellerResponse> {
      try {
        indexSellerInput.boot();
    
        const cacheKey = `sellers_{input:${JSON.stringify(indexSellerInput)}}`;
        
        const cachedData = await this.cacheManager.get<string>(cacheKey);
    
        if (cachedData) {
          return this.decompressionService.decompressData(cachedData);
        }
        const pattern = 'pagination_sellers';
        const payload = {indexSellerInput};
  
        const compressedPayload = this.compressionService.compressData(payload);
  
        let result = await this.rabbitSellersService.send(pattern, { data: compressedPayload  });
        const decompressedResultData = this.decompressionService.decompressData(result)
        const sellerIds = await this.extractBrnadIds(decompressedResultData[0]);

          try {
            const [addressData, sellerFile] = await Promise.all([
                this.getAdressInfo(sellerIds),
                this.getSellerFile(sellerIds)
            ]);
    
            Promise.all(decompressedResultData[0].map(async (seller: SellerDTO, index: number) => {
                const correspondingImageUrl = sellerFile.find(asset => asset.sellerId === seller.id) || [];
                const correspondingAddress = addressData.find(address => address.relatedId === seller.id) || null;
                seller.files = [correspondingImageUrl];
                if(correspondingAddress){
                  seller.address = [correspondingAddress];
                }
                return seller;
            }));
    
          } catch (error) {
              // Handle errors appropriately
              console.error("Error processing data:", error);
          }
  

        const decompressedResult: PaginationSellerResponse =
        PaginationSellerResponse.make(indexSellerInput, decompressedResultData[1], decompressedResultData[0]);
        await this.cacheManager.set(cacheKey,this.compressionService.compressData(decompressedResult),CacheTTL.ONE_WEEK);
        return decompressedResult
      } catch(e){
        console.log('sellers',e)
        throw new Error(`Error in pagination_sellers : ${e}`);
      }
 

  }

  async extractBrnadIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }

  private async sendBrandImageMessage(brandIds: number[]) {
    const cacheKey = `brandImages_{ids:${brandIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const payload = { brandIds,type:'LOGO' };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitAssetsService.send('getBrandFiles',  { data: compressedPayload });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    return response;
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
    const updatedResultData = await Promise.all(decompressedResultData.map(async (brand: brandDto, index: number) => {
      const correspondingImageUrl = branadImages.find(asset => asset.brandId === brand.id) || [];
  
      return {
          ...brand,
          files: [correspondingImageUrl],
      };
     }));
  
          await this.cacheManager.set(cacheKey,this.compressionService.compressData(updatedResultData),
    CacheTTL.ONE_MONTH);

    return updatedResultData;
  }
  async removeSellerFile(id: number): Promise<Boolean>{
    const pattern =  'remove_seller_file' ;
    const payload = { id };
    const compressedPayload = this.compressionService.compressData(payload);
      
    const result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });

    return result;
  }
  async updateSellerFile(createSellerFileInput: CreateSellerFileInput): Promise<boolean> {
    try {
      const pattern = 'update_seller_file';
      const payload = { createSellerFileInput };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });

      return result;
    } catch (error) {
      return false
    }

  }

}
