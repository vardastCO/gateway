import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { CountryModule } from "src/base/location/country/country.module";
import { User } from "./entities/user.entity";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CountryModule,
    KavenegarModule,
  ],
  providers: [
    UserResolver,
    UserService,
    CompressionService,
    DecompressionService,
  ],
  exports: [UserService],
})
export class UserModule {}
