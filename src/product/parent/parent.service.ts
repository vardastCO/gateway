import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { IndexParentInput } from './dto/index-parent.input';
import { PaginationParentResponse } from './dto/pagination-parent.response';
import { ParentProductDTO } from './dto/parentProductDTO';
import * as zlib from 'zlib';


@Injectable()
export class ParentService {
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


 

  async pagination(indexParentInput: IndexParentInput): Promise<PaginationParentResponse[]> {
      const pattern = { cmd: 'pagination_parent' };
      console.log('12',indexParentInput)
      // Convert indexParentInput to JSON
      const jsonInput = JSON.stringify(indexParentInput);
  
      console.log('2',jsonInput)
      // Compress the JSON string
      const compressedInput = zlib.gzipSync(jsonInput);
  
      // Convert compressed input to buffer
      const payload = { data: compressedInput.toString('base64') };
  
      try {
        let result = await this.productService.send(pattern, payload).toPromise();
        // Decompress the result
        const decompressedResult = zlib.gunzipSync(Buffer.from(result, 'base64')).toString();
        return JSON.parse(decompressedResult);
      } catch (error) {
          console.error("Error parsing JSON:", error);
      }
  }
  


  async findOne(id: number, slug?: string): Promise<ParentProductDTO>{

    
    const pattern = { cmd: 'find_one_parent' };
    const payload = { id, slug };
    let result = await this.productService.send(pattern, payload).toPromise();

    return JSON.parse(result);
  }


  async remove(id: number): Promise<ParentProductDTO>{

    const pattern = { cmd: 'remove_parent' };
    const payload = { id };
    let result = await this.productService.send(pattern, payload).toPromise();

    return JSON.parse(result);
  }
}
