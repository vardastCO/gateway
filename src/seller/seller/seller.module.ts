import { Module } from "@nestjs/common";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { SellerResolver } from "./seller-resolver";
import { SellerService } from "./seller.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { RepresentativeService } from "./representative.service";
import { RepresentativeResolver } from "./representative.resolver";
import { RabbitLogsService } from "src/rabbit-log.service";

@Module({
  providers: [
    SellerResolver,
    SellerService,
    RepresentativeResolver,
    RepresentativeService,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitLogsService,
    RabbitAssetsService,
    RabbitSellersService,
  ],
})
export class SellerModule {}
