import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { PermissionResolver } from "./permission.resolver";
import { PermissionService } from "./permission.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [
    PermissionResolver, 
    PermissionService, 
    CompressionService,
    DecompressionService,
  ],
})
export class PermissionModule {}
