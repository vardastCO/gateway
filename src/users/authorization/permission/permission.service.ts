import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IndexPermissionInput } from "./dto/index-permission.input";
import { PaginationPermissionResponse } from "./dto/pagination-permission.response";
import { UpdatePermissionInput } from "./dto/update-permission.input";
import { Permission } from "./entities/permission.entity";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  Inject,
} from "@nestjs/common";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
// @Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
  ) {}

  async findAll(
    indexPermissionInput?: IndexPermissionInput,
  ): Promise<Permission[]> {
    const cacheKey = `permissions_find_all_{index:${JSON.stringify(indexPermissionInput)}}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);
    }
    const { take, skip, subject, action, displayName } =
      indexPermissionInput || {};
    const result =  await this.permissionRepository.find({
      skip,
      take,
      where: { subject, action, displayName },
      order: { id: "ASC" },
    });

    await this.cacheManager.set(cacheKey,this.compressionService.compressData(result),CacheTTL.ONE_WEEK)

    return result
  }

  async paginate(
    indexPermissionInput?: IndexPermissionInput,
  ): Promise<PaginationPermissionResponse> {
    const cacheKey = `permissions_pagiante_{index:${JSON.stringify(indexPermissionInput)}}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);
    }
    indexPermissionInput.boot();
    const { take, skip, subject, action, displayName } =
      indexPermissionInput || {};
    const [data, total] = await Permission.findAndCount({
      skip,
      take,
      where: { subject, action, displayName },
      order: { id: "ASC" },
    });

    const response =  PaginationPermissionResponse.make(indexPermissionInput, total, data);

    await this.cacheManager.set(cacheKey,this.compressionService.compressData(response),CacheTTL.ONE_WEEK)

    return response
  }

  async findOne(id: number, name?: string): Promise<Permission> {

    const cacheKey = `permission_{index:${JSON.stringify(id)}}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);
    }
    const permission = await this.permissionRepository.findOneBy({ id, name });
    if (!permission) {
      throw new NotFoundException();
    }
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(permission),CacheTTL.ONE_WEEK)
    return permission;
  }

  async update(
    id: number,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission> {
    const permission: Permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionInput,
    });
    if (!permission) {
      throw new NotFoundException();
    }
    await this.permissionRepository.save(permission);
    return permission;
  }
}
