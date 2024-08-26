import { IndexBrandInput } from './dto/index-brand.input';
import { PaginationBrandResponse } from './dto/pagination-brand.response';
import { brandDto } from './dto/brandDto';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { CreateBrandInput } from './dto/create-brand.input';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { CreateBrandFileInput } from './dto/create-brand-file.input';
import { BrandTypeEnum } from './enums/brnad-type.enum';
import { UpdateBrandInput } from './dto/update-brand.input';
import { RabbitLogsService } from 'src/rabbit-log.service';
@Injectable()
export class BrandService {

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService, 
    private readonly rabbitLogsService: RabbitLogsService, 
    private readonly rabbitAssetsService: RabbitAssetsService,  
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async filterBrandByCategoryWithoutPaginations(categoryId: number): Promise<brandDto[]> {

    const cacheKey = `filterBrandByCategoryWithoutPaginations_{id:${JSON.stringify(categoryId)}}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : brandDto[] = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'filter_brand_by_category';
    
    const payload = { categoryId };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result)
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(decompressedResultData)
    ,CacheTTL.ONE_DAY)
   ;
     return decompressedResultData
  
    
  }


  async paginate(indexBrandInput: IndexBrandInput): Promise<PaginationBrandResponse> {
    indexBrandInput.boot();
    const cacheKey = `brands_${JSON.stringify(indexBrandInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : PaginationBrandResponse = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'pagination_brand';
    
    const payload = { indexBrandInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result)

    const brandIds = await this.extractBrnadIds(decompressedResultData[0]);

    const promises = [
      this.sendImageMessage(brandIds),
    ];

    const [branadImages] = await Promise.all(promises);
    const brands = decompressedResultData[0].map((brand: brandDto, index: number) => {
      const correspondingImageUrl = branadImages.find(asset => asset.id === brand.id)?.files || null;
      
     
      return {
        ...brand,
        imageUrl: correspondingImageUrl,
      };
  
    })


    const decompressedResult: PaginationBrandResponse =
    PaginationBrandResponse.make(indexBrandInput, decompressedResultData[1], brands);
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(decompressedResult)
     ,CacheTTL.ONE_WEEK)
    ;
    return decompressedResult;
  }
  private async sendImageMessage(brandIds: number[]) {
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
  private async getBrandFile(brandIds: number[],type:BrandTypeEnum) {
    const cacheKey = `brandFiles_{id:${brandIds},type:${type}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const payload = { brandIds,type };

    const compressedPayload = this.compressionService.compressData(payload);
    const response = await this.rabbitAssetsService.send('getBrandFiles',  { data: compressedPayload });
    await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);

    return response;
  }
  private async getBrandData(brandId: number,type:BrandTypeEnum) {
    const cacheKey = `brandData_{id:${brandId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      return this.decompressionService.decompressData(cachedData);
    }
    const pattern = 'find_one_brand' ;
    const payload = { brandId,type };


    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    
    const decompressedResult = this.decompressionService.decompressData(result);
    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    return decompressedResult;
  }
  async extractBrnadIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }

  async update(
    id: number,
    updateBrandInput: UpdateBrandInput,
  ): Promise<brandDto> {


    const cacheKey = `brand_{id:${id}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }

    try {
      const pattern = 'update_brand';
      const payload = { updateBrandInput };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
      const decompressedResult = this.decompressionService.decompressData(result);
      await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
      return decompressedResult;
    } catch (error) {
      return 
    }
    
  }
  async updateBrandFile(createBrandFileInput: CreateBrandFileInput): Promise<boolean> {
    try {
      const pattern = 'update_brand_file';
      const payload = { createBrandFileInput };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });

      return result;
    } catch (error) {
      return false
    }

  }

  async create(createBrandInput: CreateBrandInput): Promise<brandDto> {
    
    try {
      const pattern = 'create_brand';
      const payload = { createBrandInput };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

      return this.decompressionService.decompressData(result);
    } catch (error) {
       
      throw new Error('Brand with the same name or name_en already exists');
      
    }

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
  async findOne(id: number, type: BrandTypeEnum): Promise<brandDto>{
    this.AddView(id,'BRAND')
    const cacheKey = `brand_{id:${id}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : brandDto = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;
    }

    const promises = [
      this.getBrandFile([id],type),
      this.getBrandData(id,type),
    ];

    const [brandFile,brandData] = await Promise.all(promises);
    brandData.files = brandFile;
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(brandData)
    ,CacheTTL.ONE_DAY);
    return brandData;
  }


  async remove(id: number): Promise<Boolean>{
    try {
      const pattern =  'remove_brand' ;
      const payload = { id };
      const compressedPayload = this.compressionService.compressData(payload);
        
      const result = this.rabbitMQService.send(pattern, { data: compressedPayload });
  
      return true;
    }catch(e){
     return false
    }
   
  }

  async removeBrandFile(id: number): Promise<Boolean>{
    const pattern =  'remove_brand_file' ;
    const payload = { id };
    const compressedPayload = this.compressionService.compressData(payload);
      
    const result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });

    return result;
  }
}
