import { Module } from '@nestjs/common';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { PreFileModule } from './preFile/pre.file.module';
import { PreOrderModule } from './preOrder/pre.order.module';
import { PreOrderLineModule } from './line/pre-order-line.module';

@Module({
  imports:[
    PreOrderModule,
    PreFileModule,
    PreOrderLineModule
  ],
  providers: [
    CompressionService,
    DecompressionService,
  ]
})
export class OrderModule {}
