import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthorizationGuard } from "./authorization.guard";
import { AuthorizationService } from "./authorization.service";
import { PermissionModule } from "./permission/permission.module";
import { RoleModule } from "./role/role.module";
import { CacheModule } from "@nestjs/cache-manager";
import { cacheAsyncConfig } from "src/config/cache.config";
@Global()
@Module({
  imports: [
    PermissionModule,
    RoleModule,
    CacheModule.registerAsync(cacheAsyncConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    AuthorizationService,
  ],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
