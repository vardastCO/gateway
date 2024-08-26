import { Module } from '@nestjs/common';
import { PreOrderLineService } from './pre-order-line.service';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { PreOrderLineResolver } from './pre-order-line.resolver';
import { RabbitOrdersService } from 'src/rabbit-order.service';
@Module({
  providers: [
    PreOrderLineService,
    PreOrderLineResolver,
    CompressionService,
    DecompressionService,
    RabbitOrdersService
  ]
})
export class PreOrderLineModule {}
