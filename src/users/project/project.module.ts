import { Module } from "@nestjs/common";
import { ProjectService } from "./project.service";

import { RabbitSellersService } from "src/rabbit-seller.service";
import { CompressionService } from "src/compression.service";
import { ProjectResolver } from "./project.resolver";
import { DecompressionService } from "src/decompression.service";

@Module({
  providers: [
    ProjectResolver,
    ProjectService, 
    RabbitSellersService,
    CompressionService,
    DecompressionService,
  ],
})
export class ProjectModule {}
