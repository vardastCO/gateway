import { Module } from "@nestjs/common";
import { AddressService } from "./address.service";
import { AddressResolver } from "./address.resolver";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  providers: [
    AddressResolver,
    AddressService,
    RabbitSellersService,
    CompressionService,
    DecompressionService
  ],
})
export class AddressModule {}
