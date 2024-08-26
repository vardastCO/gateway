import { Module } from '@nestjs/common';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { PreFileService } from './pre-file.service';
import { PreFileResolver } from './pre-file.resolver';
import { RabbitOrdersService } from 'src/rabbit-order.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
@Module({
  providers: [
    PreFileService,
    PreFileResolver,
    CompressionService,
    DecompressionService,
    RabbitOrdersService,
    RabbitAssetsService
  ]
})
export class PreFileModule {}
