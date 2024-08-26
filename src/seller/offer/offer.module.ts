import { Module } from "@nestjs/common";
import { OfferResolver } from "./offer.resolver";
import { OfferService } from "./offer.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitMQService } from "src/rabbit-mq.service";

@Module({
  providers: [
    OfferResolver,
    OfferService,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitAssetsService,
    RabbitSellersService
  ],
})
export class OfferModule {}
