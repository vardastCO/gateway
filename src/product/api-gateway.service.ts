import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';


@Injectable()
export class ApiGatewayService {
  private productService: ClientProxy;

  constructor() {
    
    this.productService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'product_queue',
        queueOptions: { durable: true },
      },
    });
  }
}
