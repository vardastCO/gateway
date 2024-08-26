import { Module } from "@nestjs/common";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { PriceResolver } from "./price-resolver";
import { PriceService } from "./price.service";



@Module({
  providers: [
    PriceResolver,
    PriceService,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitAssetsService,
    RabbitSellersService
  ],
})
export class PriceModule {}
