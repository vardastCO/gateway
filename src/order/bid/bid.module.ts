import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { BidResolver } from './bid.resolver';
@Module({
  providers: [
    BidService,
    BidResolver,
    CompressionService,
    DecompressionService,
  ]
})
export class BidModule {}
