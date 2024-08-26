import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { ContactUs } from "./entities/Contact.entity";
import { CreateContactInput } from "./dto/create-contact.input";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { IndexContactInput } from "./dto/IndexContactInput";

@Injectable()
export class ContactUsService {

    constructor(
        private readonly compressionService: CompressionService,
        private readonly decompressionService: DecompressionService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
      ) {}
    
    // CRUD
    async createContactUs(createContactInput: CreateContactInput): Promise<ContactUs> {
        try{
            const cacheKey = `contact_us_all_{total:all}`;
            const keyExists = await this.cacheManager.get(cacheKey);
            if (keyExists) {
                await this.cacheManager.del(cacheKey);
            }
            const { fullname, title,cellphone,text,fileId } = createContactInput;

            const things     = new ContactUs()
            things.fullname  = fullname
            things.title     = title
            things.cellphone = cellphone
            things.text      = text
            things.fileId    = fileId ?? null
    
            await things.save()
            return things
        }catch(e){
         console.log('err in createContactUs ',e)
        }
       
    }

    async findOneContactUs(id: number): Promise<ContactUs> {
        const cacheKey = `contact_us_{id:${id}}`;
      
        const cachedData = await this.cacheManager.get<string>(cacheKey);
      
        if (cachedData) {
          const decompressedData : ContactUs = 
          this.decompressionService.decompressData(cachedData);
     
          return decompressedData;
    
        }
        const faq: ContactUs = await ContactUs.findOneBy({ id: id })
        if (!faq) {
            throw new NotFoundException();
        }
        const result = this.compressionService.compressData(faq)

        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    
        const decompressedResult = this.decompressionService.decompressData(result);

        return decompressedResult;
    }

    async getAllContactUs( indexContactInput?: IndexContactInput): Promise<PaginationContactUsResponse> {

        try{
            indexContactInput.boot()
            const cacheKey = `contact_us_all_{total:${JSON.stringify(indexContactInput)}}`;
          
            const cachedData = await this.cacheManager.get<string>(cacheKey);
          
            if (cachedData) {
              const decompressedData : PaginationContactUsResponse = 
              this.decompressionService.decompressData(cachedData);
              console.log('result',decompressedData)
              return decompressedData;
            }
            const [result, total] = await ContactUs.findAndCount({
                take:indexContactInput.take,
                skip:indexContactInput.skip,
                order : {
                    id:'DESC'
                }
              });
    
            const res = PaginationContactUsResponse.make(indexContactInput,total, result);
          
            const compressedResponse = this.compressionService.compressData(res);
     
            await this.cacheManager.set(cacheKey, compressedResponse,CacheTTL.ONE_DAY);
    
            return res;
        }catch(e){
          console.log('err',e)
        }
       

    }
}

