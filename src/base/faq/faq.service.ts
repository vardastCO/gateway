import { FAQ } from "./entities/faq.entity";
import { UpdateFaqInput } from "./dto/update-faq.input"
import { CreateFaqInput } from "./dto/create-faq.input"
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
@Injectable()
export class FaqService {

    constructor(
        private readonly compressionService: CompressionService,
        private readonly decompressionService: DecompressionService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
      ) {}
    
    // CRUD
    async createFaq(createFaqInput: CreateFaqInput): Promise<FAQ> {
        const { answer, question } = createFaqInput;

        if (createFaqInput && createFaqInput) {
            const existFaq = await FAQ.findOneBy({
                question,
                answer
            })

            if (existFaq) {
                return existFaq;
            }

            const faq: FAQ = FAQ.create({ question, answer })
            await faq.save();
            
            return faq
        }
    }

    async findOne(id: number): Promise<FAQ> {
        const cacheKey = `faq_{id:${id}}`;
      
        const cachedData = await this.cacheManager.get<string>(cacheKey);
      
        if (cachedData) {
          const decompressedData : FAQ = 
          this.decompressionService.decompressData(cachedData);
     
          return decompressedData;
    
        }
        const faq: FAQ = await FAQ.findOneBy({ id: id })
        if (!faq) {
            throw new NotFoundException();
        }
        const result = this.compressionService.compressData(faq)

        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    
        const decompressedResult = this.decompressionService.decompressData(result);

        return decompressedResult;
    }

    async update(id: number, updateFaqInput: UpdateFaqInput): Promise<FAQ> {
        const cacheKey = `faq_{id:${id}}`;
        const keyExists = await this.cacheManager.get(cacheKey);
        if (keyExists) {
          await this.cacheManager.del(cacheKey);
        }
        const faq: FAQ = await FAQ.findOneBy({ id: id });
        if (!faq) {
            throw new NotFoundException();
        }
        
        faq.answer = updateFaqInput.answer;
        faq.question = updateFaqInput.question;
        await faq.save()

        const result = this.compressionService.compressData(faq)

        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    
        const decompressedResult = this.decompressionService.decompressData(result);

        return decompressedResult;
    }

    async remove(id: number): Promise<FAQ>{
        const faq: FAQ = await FAQ.findOneBy({ id: id });
        if (!faq) {
            throw new NotFoundException();
        }
        await faq.remove();
        faq.id = id;
        return faq;
    }

    async getAllFaqs(): Promise<FAQ[]> {
        const cacheKey = `faqs_{total:all}`;
      
        const cachedData = await this.cacheManager.get<string>(cacheKey);
      
        if (cachedData) {
          const decompressedData : FAQ[] = 
          this.decompressionService.decompressData(cachedData);
     
          return decompressedData;
    
        }
        const faqs: FAQ[] = await FAQ.find({});

        const result = this.compressionService.compressData(faqs)

        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
    
        const decompressedResult = this.decompressionService.decompressData(result);

        return decompressedResult;

    }
}

