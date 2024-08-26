// favorite.module.ts

import { Module } from "@nestjs/common";
import { FavoriteResolver } from "./favorite.resolver";
import { FavoriteService } from "./favorite.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitSellersService } from "src/rabbit-seller.service";

@Module({
  providers: [
    FavoriteService, 
    FavoriteResolver,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitAssetsService, 
    RabbitSellersService 
  ],
})
export class FavoriteModule {}
