import { Module } from "@nestjs/common";
import { ParentService } from "./parent.service";
import { ParentResolver } from "./parent-resolver";


@Module({
  providers: [
    ParentService,ParentResolver
  ],
})
export class ParentModule {}
