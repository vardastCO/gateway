import { Module } from "@nestjs/common";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { SellerModule } from "./seller/seller.module";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { PriceModule } from "./price/price.module";
import { OfferModule } from "./offer/offer.module";

@Module({
  imports:[
    SellerModule,
    PriceModule,
    OfferModule
  ],
  providers: [
    CompressionService,
    DecompressionService,
    RabbitSellersService,
  ],
  
})
export class SellersModule {}
