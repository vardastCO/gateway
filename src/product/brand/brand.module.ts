import { Module } from "@nestjs/common";
import { BrandResolver } from "./brand-resolver";
import { BrandService } from "./brand.service";
import { BrandCatalogueResolver } from "./catalogue/brand-catalogue-resolver";
import { BrandCatalogueService } from "./catalogue/brand-catalogue.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitMQModule } from "src/rabbit-mq.module";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitLogsService } from "src/rabbit-log.service";

@Module({
  imports: [RabbitMQModule], 
  providers: [
      BrandResolver,
      BrandService,
      BrandCatalogueResolver,
      BrandCatalogueService,
      CompressionService,
      DecompressionService,
      RabbitMQService,
      RabbitLogsService,
      RabbitAssetsService,  

  ],
})
export class BrandModule {}
