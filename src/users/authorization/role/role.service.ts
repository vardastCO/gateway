import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository ,IsNull} from "typeorm";
import { CreateRoleInput } from "./dto/create-role.input";
import { IndexRoleInput } from "./dto/index-role.input";
import { PaginationRoleResponse } from "./dto/pagination-role.response";
import { UpdateRoleInput } from "./dto/update-role.input";
import { Role } from "./entities/role.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  Inject,
} from "@nestjs/common"
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
  ) {}

  async create(createRoleInput: CreateRoleInput): Promise<Role> {
    // TODO: fix
    // if (typeof createRoleInput.permissionIds == 'array') {
    //   createRoleInput.permissions = createRoleInput.
    // }
    return await this.roleRepository.save(createRoleInput);
  }

  async findAll(indexRoleInput?: IndexRoleInput): Promise<Role[]> {
    const { take, skip, isActive } = indexRoleInput || {};
    const cacheKey = `roles_{all:${indexRoleInput}}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {

      const decompressedData : Role[] = 
      this.decompressionService.decompressData(cachedData);

      return decompressedData;
    }
    const result =  await this.roleRepository.find({
      skip,
      take,
      where: { isActive },
      order: { displayName: "ASC", id: "DESC" },
    });

    const compressedPayload = this.compressionService.compressData(result);

    await this.cacheManager.set(cacheKey, compressedPayload,CacheTTL.ONE_DAY);

    const decompressedResultData = this.decompressionService.decompressData(compressedPayload);

    return decompressedResultData
  }

  async paginate(
    indexRoleInput?: IndexRoleInput,
  ): Promise<PaginationRoleResponse> {
    indexRoleInput.boot();
    const cacheKey = `roles_pagination_${JSON.stringify(indexRoleInput)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {

      const decompressedData : PaginationRoleResponse = 
      this.decompressionService.decompressData(cachedData);

      return decompressedData;
    }
    const { take, skip, isActive } = indexRoleInput || {};
    const [data, total] = await Role.findAndCount({
      skip,
      take,
      where: { isActive, deletedAt: IsNull() },
      order: { displayName: "ASC", id: "DESC" },
    });
    const response = PaginationRoleResponse.make(indexRoleInput, total, data)
    
    const compressedPayload = this.compressionService.compressData(response);

    await this.cacheManager.set(cacheKey, compressedPayload,CacheTTL.ONE_DAY);

    const decompressedResultData = this.decompressionService.decompressData(compressedPayload);

    return decompressedResultData

  }

  async findOne(id: number, name?: string): Promise<Role> {
    const cacheKey = `role_{id:${id}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      const decompressedData: Role = this.decompressionService.decompressData(cachedData);
      return decompressedData;
  }
    const role = await this.roleRepository.findOneBy({ id, name });
    if (!role) {
      throw new NotFoundException();
    }
    const compressedPayload = this.compressionService.compressData(role);

    await this.cacheManager.set(cacheKey, compressedPayload,CacheTTL.ONE_DAY);
    
    const decompressedResult = this.decompressionService.decompressData(compressedPayload);

    return decompressedResult;
  }

  async update(id: number, updateRoleInput: UpdateRoleInput): Promise<Role> {
    const role: Role = await this.roleRepository.preload({
      id,
      ...updateRoleInput,
    });
    if (!role) {
      throw new NotFoundException();
    }
    await this.roleRepository.save(role);
    return role;
  }

  async remove(id: number): Promise<Role> {
    const role: Role = await Role.findOneBy({ id })
    
    if (!role) {
        throw new Error('Role not found');
    }

    role.deletedAt = new Date(); 

    return await role.save(); 
  }
}
