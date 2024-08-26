import { Module } from "@nestjs/common";
import { UomResolver } from "./uom-resolver";
import { UomService } from "./uom.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";

@Module({
  providers: [
      UomResolver,
      UomService,
      CompressionService,
      DecompressionService,
      RabbitMQService
  ],
})
export class UomModule {}
