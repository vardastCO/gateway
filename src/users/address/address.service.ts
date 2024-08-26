import { Injectable, NotFoundException } from "@nestjs/common";
import { City } from "src/base/location/city/entities/city.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { User } from "../user/entities/user.entity";
import { CreateAddressInput } from "./dto/create-address.input";
import { IndexAddressInput } from "./dto/index-address.input";
import { PaginationAddressResponse } from "./dto/pagination-address.response";
import { UpdateAddressInput } from "./dto/update-address.input";
import { Address } from "./entities/address.entity";
import { AddAddressInput } from "./dto/add-address.input";
import { AddressRelatedTypes } from "./enums/address-related-types.enum";
import { ContryTypes } from "../auth/enums/country-types.enum";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { CompressionService } from "src/compression.service";
import { SellerRepresentativeDTO } from "src/seller/seller/dto/SellerRepresentativeDTO";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Cache } from "cache-manager";

@Injectable()
export class AddressService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly rabbitSellersService: RabbitSellersService,
    

  )  {}
  async create(createAddressInput: CreateAddressInput): Promise<Address> {
    const address: Address = Address.create<Address>(createAddressInput);
    await address.save();
    return address;
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
  async add(addAddressInput: AddAddressInput,user:User): Promise<Address> {
    const sellerId = (await this.findSeller(user.id)).sellerId

    const address: Address = Address.create<Address>(addAddressInput);
    address.relatedId = sellerId
    address.userId = user.id
    address.relatedType = AddressRelatedTypes.SELLER
    address.countryId = ContryTypes.IRAN
    address.latitude = addAddressInput.latitude ?? null
    address.longitude = addAddressInput.longitude ?? null
    address.sort  = addAddressInput.sort ?? 0
    address.isPublic = addAddressInput.isPublic ?? true
    await address.save();
    return address;
  }

  async findAll(indexAddressInput?: IndexAddressInput): Promise<Address[]> {
    indexAddressInput.boot();
    const { take, skip } = indexAddressInput || {};
    return await Address.find({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });
  }

  async myAddress(user: User): Promise<Address[]> {
    const sellerId = (await this.findSeller(user.id)).sellerId
    return await Address.find({
      where: {
        relatedId : sellerId ?? user.id
      },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexAddressInput?: IndexAddressInput,
  ): Promise<PaginationAddressResponse> {
    indexAddressInput.boot();
    const { take, skip } = indexAddressInput || {};
    const [data, total] = await Address.findAndCount({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });

    return PaginationAddressResponse.make(indexAddressInput, total, data);
  }

  async findOne(id: number): Promise<Address> {
    const address = await Address.findOneBy({ id });
    if (!address) {
      throw new NotFoundException();
    }
    return address;
  }

  async update(
    id: number,
    updateAddressInput: UpdateAddressInput,
    user: User,
  ): Promise<Address> {
    const address: Address = await Address.preload({
      id,
      ...updateAddressInput,
    });
    if (!address) {
      throw new NotFoundException();
    }

    address.user = Promise.resolve(user);

    await address.save();
    return address;
  }

  async remove(id: number): Promise<Address> {
    const address: Address = await this.findOne(id);
    await address.remove();
    address.id = id;
    return address;
  }

  async getProvinceOf(address: Address): Promise<Province> {
    return await address.province;
  }

  async getCityOf(address: Address): Promise<City> {
    return await address.city;
  }

  async getAdminOf(address: Address): Promise<User> {
    return await address.user;
  }
}
