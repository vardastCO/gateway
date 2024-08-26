import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbit-mq.service';
import { RabbitAssetsService } from './rabbit-asset.service';
import { RabbitSellersService } from './rabbit-seller.service';
import { RabbitLogsService } from './rabbit-log.service';
import { RabbitOrdersService } from './rabbit-order.service';

@Module({
  controllers: [],
  providers: [RabbitMQService,RabbitAssetsService,RabbitSellersService,RabbitLogsService,RabbitOrdersService],
  exports: [RabbitMQService,RabbitAssetsService,RabbitSellersService,RabbitLogsService,RabbitOrdersService],
})
export class RabbitMQModule {}