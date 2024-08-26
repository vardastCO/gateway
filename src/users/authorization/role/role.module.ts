import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { RoleResolver } from "./role.resolver";
import { RoleService } from "./role.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [
    RoleResolver,
    RoleService,
    CompressionService,
    DecompressionService
  ],
})
export class RoleModule {}
