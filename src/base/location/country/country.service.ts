import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCountryInput } from "./dto/create-country.input";
import { IndexCountryInput } from "./dto/index-country.input";
import { UpdateCountryInput } from "./dto/update-country.input";
import { Country } from "./entities/country.entity";
import { PaginationCountryResponse } from "./dto/pagination-country.response";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  Inject,
} from "@nestjs/common"
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
  ) {}

  async create(createCountryInput: CreateCountryInput) {
    return await this.countryRepository.save(
      this.countryRepository.create(createCountryInput),
    );
  }

  async findAll(indexCountryInput?: IndexCountryInput): Promise<Country[]> {
    const { take, skip, isActive } = indexCountryInput || {};
    const cacheKey = `countries_out_${JSON.stringify({ take, skip, isActive })}`;

  try {
      const cachedData = await this.cacheManager.get<Country[]>(cacheKey);

      if (cachedData) {

        return cachedData;
      }
      const countries =  await this.countryRepository.find({
        skip,
        take,
        where: { isActive },
        order: { sort: "ASC", id: "DESC" },
      });
   
      await this.cacheManager.set(cacheKey, countries,CacheTTL.ONE_DAY);

      return countries;
    } catch (error) {
      console.error('Error while fetching data:', error);
    }
  }

  async paginate(
    indexCountryInput?: IndexCountryInput,
  ): Promise<PaginationCountryResponse> {
    indexCountryInput.boot();
    const { take, skip, isActive } = indexCountryInput || {};

    const cacheKey = `countries_${JSON.stringify({ take, skip, isActive })}`;

    try {
      const cachedData = await this.cacheManager.get<string>(cacheKey);
      
        if (cachedData) {
          const decompressedData : PaginationCountryResponse = 
          this.decompressionService.decompressData(cachedData);
    
          return decompressedData;
    
        }
        const [data, total] = await Country.findAndCount({
          skip,
          take,
          where: { isActive },
          order: { sort: "ASC", id: "DESC" },
        });
  
        const result =  PaginationCountryResponse.make(
          indexCountryInput, 
          total,
          data
        );
        const compressedPayload = this.compressionService.compressData(result);
        await this.cacheManager.set(cacheKey, compressedPayload,CacheTTL.ONE_DAY);
        const decompressedResult = this.decompressionService.decompressData(compressedPayload);

        return decompressedResult;
      } catch (error) {
        console.error('Error while fetching data:', error);
      }

  }

  async findOne(id: number, slug?: string): Promise<Country> {
    const country = await this.countryRepository.findOneBy({ id, slug });
    if (!country) {
      throw new NotFoundException();
    }
    return country;
  }

  async update(
    id: number,
    updateCountryInput: UpdateCountryInput,
  ): Promise<Country> {
    const country: Country = await this.countryRepository.preload({
      id,
      ...updateCountryInput,
    });
    if (!country) {
      throw new NotFoundException();
    }
    await this.countryRepository.save(country);
    return country;
  }

  async remove(id: number): Promise<Country> {
    const country: Country = await this.findOne(id);
    await this.countryRepository.remove(country);
    country.id = id;
    return country;
  }
}
