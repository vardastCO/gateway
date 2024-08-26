import { Module } from "@nestjs/common";
import { ApiGatewayService } from "./api-gateway.service";
import { BrandModule } from "./brand/brand.module";
import { UomModule } from "./uom/uom.module";
import { CategoryModule } from "./category/category.module";
import { ParentModule } from "./parent/parent.module";
import { ProductSinModule } from "./product/product.module";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { AttribuiteModule } from "./attribute/attribuite.module";
import { ValueModule } from "./attributeValue/value.module";
import { OptionModule } from "./option/option.module";
import { ImagesModule } from "./image/images.module";

@Module({
  imports:[
    BrandModule,
    UomModule,
    CategoryModule,
    ParentModule,
    ProductSinModule,
    AttribuiteModule,
    ValueModule,
    OptionModule,
    ImagesModule 
  ],
  providers: [
    ApiGatewayService,
    CompressionService,
    DecompressionService
  ],
  
})
export class ProductModule {}
