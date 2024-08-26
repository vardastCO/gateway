import { Module } from "@nestjs/common";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { RegistrationResolver } from "./registration.resolver";
import { RegistrationService } from "./registration.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  imports: [ KavenegarModule],
  providers: [
     RegistrationResolver,
     RegistrationService,
     CompressionService,
     DecompressionService,
    ],
})
export class RegistrationModule {}
