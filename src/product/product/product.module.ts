import { Module } from "@nestjs/common";
import { ProductResolver } from "./product-resolver";
import { ProductService } from "./product.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { RabbitLogsService } from "src/rabbit-log.service";



@Module({
  providers: [
    ProductResolver,
    ProductService,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitSellersService,
    RabbitAssetsService,
    RabbitLogsService
  ],
})
export class ProductSinModule {}
