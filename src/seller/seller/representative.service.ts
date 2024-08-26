import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { CreateSellerRepresentativeInput } from "./dto/create-seller-representative.input";
import { IndexSellerRepresentativeInput } from "./dto/index-seller-representative.input";
import { PaginationSellerRepresentativeResponse } from "./dto/pagination-seller-representative.response";
import { UpdateSellerRepresentativeInput } from "./dto/update-seller-representative.input";
import { SellerRepresentative } from "./entities/seller-representative.entity";

@Injectable()
export class RepresentativeService {
  constructor(
    private authorizationModule: AuthorizationService,
  ) {}

  async create(
    createSellerRepresentativeInput: CreateSellerRepresentativeInput,
    user: User,
  ): Promise<Boolean> {
    try {
      const sellerRepresentative: SellerRepresentative =
      SellerRepresentative.create<SellerRepresentative>({
        createdById: user.id,
        ...createSellerRepresentativeInput,
      });

      await sellerRepresentative.save();
      return true;
    } catch(e) {
      console.log('e createSellerRepresentativeInput ',e)
      return false
    }
    
  }

  async findAll(
    user: User,
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ): Promise<SellerRepresentative[]> {
    const { take, skip } = indexSellerRepresentativeInput || {};

    return await SellerRepresentative.find({
      skip,
      take,
      order: { id: "DESC" },
    });
  }

  async paginate(
    user: User,
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ): Promise<PaginationSellerRepresentativeResponse> {
    indexSellerRepresentativeInput.boot();
    const { take, skip } = indexSellerRepresentativeInput || {};

    const [data, total] = await SellerRepresentative.findAndCount({
      skip,
      take,
      order: { id: "DESC" },
    });

    return PaginationSellerRepresentativeResponse.make(
      indexSellerRepresentativeInput,
      total,
      data,
    );
  }

  async findOne(id: number): Promise<SellerRepresentative> {
    const sellerRepresentative = await SellerRepresentative.findOneBy({ id });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }
    return sellerRepresentative;
  }

  

  async update(
    id: number,
    updateSellerRepresentativeInput: UpdateSellerRepresentativeInput,
    user: User,
  ): Promise<SellerRepresentative> {
    const sellerRepresentative: SellerRepresentative =
      await SellerRepresentative.preload({
        id,
        ...updateSellerRepresentativeInput,
      });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }

    await sellerRepresentative.save();
    return sellerRepresentative;
  }

  async remove(id: number): Promise<SellerRepresentative> {
    const sellerRepresentative: SellerRepresentative = await this.findOne(id);
    await sellerRepresentative.remove();
    sellerRepresentative.id = id;
    return sellerRepresentative;
  }
}
