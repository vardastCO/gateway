import { Module } from "@nestjs/common";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { OptionResolver } from "./option-resolver";
import { OptionService } from "./option.service";



@Module({
  providers: [
    CompressionService,
    OptionResolver,
    DecompressionService,
    RabbitMQService,
    OptionService,
    RabbitSellersService,
    RabbitAssetsService
  ],
})
export class OptionModule {}
