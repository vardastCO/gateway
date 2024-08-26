import { Module } from "@nestjs/common";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { PasswordResetResolver } from "./password-reset.resolver";
import { PasswordResetService } from "./password-reset.service";
import { ConfigModule } from "src/config/config.module";
@Module({
  imports: [ConfigModule, KavenegarModule],
  providers: [PasswordResetResolver, PasswordResetService],
})
export class PasswordResetModule {}
