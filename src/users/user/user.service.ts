import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Country } from "src/base/location/country/entities/country.entity";
import { DataSource, In, Repository } from "typeorm";
import { KavenegarService } from "../../base/kavenegar/kavenegar.service";
import { CountryService } from "../../base/location/country/country.service";
import { Permission } from "../authorization/permission/entities/permission.entity";
import { Role } from "../authorization/role/entities/role.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { IndexUserInput } from "./dto/index-user.input";
import { PaginationUserResponse } from "./dto/pagination-user.response";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { UserStatusesEnum } from "./enums/user-statuses.enum";
import {  IsNull } from "typeorm";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { UpdateProfileInput } from "./dto/update-profile.input";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly countryService: CountryService,
    @Inject(DataSource) private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private kavenegarService: KavenegarService,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
  ) {}
  async updateProfile(
    updateProfileInput: UpdateProfileInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = await User.findOneBy({ id:currentUser.id });

    if (!user) {
      throw new NotFoundException();
    }
    
    Object.assign(user, updateProfileInput);
    if (updateProfileInput.firstName && updateProfileInput.lastName) {
      user.fullName = `${updateProfileInput.firstName} ${updateProfileInput.lastName}`;
    } else if (updateProfileInput.firstName) {
      user.fullName = updateProfileInput.firstName;
    } else if (updateProfileInput.lastName) {
      user.fullName = updateProfileInput.lastName;
    } else {
      user.fullName = '-'; 
    }

    this.dataSource.transaction(async () => {
      await user.save({ transaction: false });
    });

    return user;
  }
  async create(
    createUserInput: CreateUserInput,
    currentUser: User,
  ): Promise<User> {
    const user: User = User.create(
      await createUserInput.prepare(this.dataSource),
    );

    await user.save();
    return user;
  }

  async findAll(indexUserInput?: IndexUserInput): Promise<User[]> {
    const { take, skip, status, displayRoleId } = indexUserInput || {};
    return await this.userRepository.find({
      skip,
      take,
      where: { status, displayRoleId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async userCount(): Promise<number> {
    const userCount: number = await User.count();
    return userCount;
  }

  async paginate(
    indexUserInput?: IndexUserInput,
  ): Promise<PaginationUserResponse> {
    indexUserInput.boot();
    const cacheKey = `users_{index:${JSON.stringify(indexUserInput)}}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);
    }

    const { take, skip, status, displayRoleId } = indexUserInput || {};
    const [data, total] = await User.findAndCount({
      skip,
      take,
      where: { status, displayRoleId ,deletedAt:IsNull()},
      order: { createdAt: "DESC", id: "DESC" },
    });
    const response = this.compressionService
    .compressData(PaginationUserResponse.make(indexUserInput, total, data))
    await this.cacheManager.set(cacheKey,response,CacheTTL.ONE_DAY);
    return PaginationUserResponse.make(indexUserInput, total, data);
  }

  async findOne(id: number, uuid?: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id, uuid });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    currentUser: User,
  ): Promise<User> {
    let userId = id ?? currentUser.id
    const user: User = await User.findOneBy({ id:userId });

    if (!user) {
      throw new NotFoundException();
    }

    Object.assign(user, updateUserInput);
    this.dataSource.transaction(async () => {
      await user.save({ transaction: false });
    });

    return user;
  }

  async remove(id: number): Promise<User> {
    const user: User = await this.findOne(id);
    user.deletedAt = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"})
    await user.save()
    user.id = id;
    return user;
  }

  async findOneBy(constraints: {
    username?: string;
    uuid?: string;
  }): Promise<User | null> {
    return await this.userRepository.findOneBy(constraints);
  }

  getCountry(user: User): Promise<Country> {
    return this.countryService.findOne(user.countryId);
  }

  async getRoles(user: User): Promise<Role[]> {
    return await user.roles;
  }

  async getPermissions(user: User): Promise<Permission[]> {
    return await user.permissions;
  }

  async cacheRolesOf(user: User): Promise<string[]> {
    const cacheKey = `roles_user_{id:${JSON.stringify(user.id)}}`;
    const cachedData = await this.cacheManager.get<string>(
      cacheKey,
    );
    if (cachedData) {

      return this.decompressionService.decompressData(cachedData)
    }
    const roleNames = (await user.roles).map(role => role.name);
    await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(roleNames),
      CacheTTL.ONE_DAY,
    );
    return roleNames;
  }

  async cachePermissionsOf(user: User): Promise<string[]> {
    const cacheKey = `permissions_user_{id:${JSON.stringify(user.id)}}`;
    const cachedData = await this.cacheManager.get<string>(
      cacheKey,
    );

    if (cachedData) {

      return this.decompressionService.decompressData(cachedData)
    }
    const userWholePermissions = await user.wholePermissionNames();
     await this.cacheManager.set(
      cacheKey,
      this.compressionService.compressData(userWholePermissions),
      CacheTTL.ONE_DAY,
    );

    return userWholePermissions;
  }

  // async getSellerRecordOf(user: User): Promise<Seller> {
  //   return await Seller.createQueryBuilder()
  //     .where(
  //       'id = (select "sellerId" from product_seller_representatives where "userId" = :userId and role = :role order by id asc limit 1)',
  //       {
  //         userId: user.id,
  //         role: SellerRepresentativeRoles.ADMIN,
  //       },
  //     )
  //     .getOne();
  // }
}
