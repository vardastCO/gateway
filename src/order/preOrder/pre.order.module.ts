import { Module } from '@nestjs/common';
import { PreOrderService } from './pre-order.service';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { PreOrderResolver } from './pre-order.resolver';
import { RabbitOrdersService } from 'src/rabbit-order.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
@Module({
  providers: [
    PreOrderService,
    PreOrderResolver,
    CompressionService,
    DecompressionService,
    RabbitOrdersService,
    RabbitAssetsService
  ]
})
export class PreOrderModule {}
