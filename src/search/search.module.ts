import { Module } from '@nestjs/common';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { SearchService } from './search.service';
import { SearchResolver } from './seaarch-resolver';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
@Module({
  providers: [
    SearchService,
    SearchResolver,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitSellersService,
    RabbitAssetsService
  ]
})
export class SearchModule {}
